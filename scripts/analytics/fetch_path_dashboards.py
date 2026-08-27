#!/usr/bin/env python3
"""fp-1.info配下の公開サイトをパス単位で集計し、専用ダッシュボードを生成する。"""

import importlib.util
from pathlib import Path

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    FilterExpressionList,
    Metric,
    RunReportRequest,
)

BASE = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("site_dashboard_base", Path(__file__).with_name("fetch_tds.py"))
base = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(base)

PROPERTY_ID = "480292502"
MEASUREMENT_ID = "G-TH1P40Q03X"
HOST = "fp-1.info"
SITES = [
    {"name": "補助金・助成金活用型経営", "path": "/hojokin/", "file": "hojokin-keiei-dashboard.html"},
    {"name": "各省庁の最新情報", "path": "/news/", "file": "news-dashboard.html"},
    {"name": "日本運送業許可申請サポートセンター", "path": "/unsou/", "file": "unsou-dashboard.html"},
]


def query(client, path_prefix, dimensions, metrics, limit=50):
    filters = FilterExpression(and_group=FilterExpressionList(expressions=[
        FilterExpression(filter=Filter(
            field_name="hostName",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.EXACT,
                value=HOST,
            ),
        )),
        FilterExpression(filter=Filter(
            field_name="pagePath",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.BEGINS_WITH,
                value=path_prefix,
            ),
        )),
    ]))
    return client.run_report(RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name=x) for x in dimensions],
        metrics=[Metric(name=x) for x in metrics],
        date_ranges=[DateRange(start_date="28daysAgo", end_date="today")],
        dimension_filter=filters,
        limit=limit,
    ))


def collect(client, path_prefix):
    daily_report = query(client, path_prefix, ["date"], ["activeUsers", "sessions", "screenPageViews", "newUsers", "engagementRate", "averageSessionDuration"])
    daily, totals = [], {"users": 0, "sessions": 0, "pv": 0, "new_users": 0}
    engagement_weighted = duration_weighted = 0.0
    for row in daily_report.rows:
        values = row.metric_values
        users, sessions, pv, new_users = [int(values[i].value or 0) for i in range(4)]
        totals["users"] += users
        totals["sessions"] += sessions
        totals["pv"] += pv
        totals["new_users"] += new_users
        engagement_weighted += float(values[4].value or 0) * sessions
        duration_weighted += float(values[5].value or 0) * sessions
        date = row.dimension_values[0].value
        daily.append({"date": f"{date[:4]}-{date[4:6]}-{date[6:]}", "users": users, "sessions": sessions})
    totals["engagement"] = round(engagement_weighted / totals["sessions"] * 100, 1) if totals["sessions"] else 0
    totals["duration"] = round(duration_weighted / totals["sessions"]) if totals["sessions"] else 0
    pages_report = query(client, path_prefix, ["pagePath"], ["screenPageViews", "activeUsers"], 30)
    pages = [{"path": r.dimension_values[0].value, "pv": int(r.metric_values[0].value), "users": int(r.metric_values[1].value)} for r in pages_report.rows]
    channels_report = query(client, path_prefix, ["sessionDefaultChannelGroup"], ["sessions", "engagementRate"], 20)
    channels = [{"channel": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value), "engagement": f"{float(r.metric_values[1].value)*100:.1f}%"} for r in channels_report.rows]
    devices_report = query(client, path_prefix, ["deviceCategory"], ["sessions"], 10)
    devices = [{"device": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value)} for r in devices_report.rows]
    regions_report = query(client, path_prefix, ["region"], ["activeUsers"], 15)
    regions = [{"region": r.dimension_values[0].value, "users": int(r.metric_values[0].value)} for r in regions_report.rows]
    return {"summary": totals, "daily": daily, "pages": pages, "channels": channels, "devices": devices, "regions": regions}


def main():
    client = BetaAnalyticsDataClient(credentials=base.creds())
    for site in SITES:
        base.HOSTNAME = f"{HOST}{site['path'].rstrip('/')}"
        base.PROPERTY_ID = PROPERTY_ID
        base.MEASUREMENT_ID = MEASUREMENT_ID
        base.TRACKING_STATUS = "GA4実測確認済み（2026-08-27）"
        data = collect(client, site["path"])
        html = base.build(data).replace(
            f"hostname = {base.HOSTNAME}",
            f"hostname = {HOST} / pagePath begins {site['path']}",
        )
        html = html.replace(
            f"<title>{base.HOSTNAME} アナリティクス</title>",
            f"<title>{site['name']} アナリティクス</title>",
        ).replace(
            f"<h1>{base.HOSTNAME} アナリティクス</h1>",
            f"<h1>{site['name']} アナリティクス</h1>",
        )
        out = BASE / site["file"]
        out.write_text(html, encoding="utf-8")
        print(f"{site['path']}\t{site['file']}\tusers={data['summary']['users']}\tsessions={data['summary']['sessions']}\tpv={data['summary']['pv']}")


if __name__ == "__main__":
    main()
