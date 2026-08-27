#!/usr/bin/env python3
"""Claude Code製ダッシュボードと同じGA4構成で、サイト別HTMLを一括生成する。"""

import importlib.util
from pathlib import Path

from google.analytics.data_v1beta import BetaAnalyticsDataClient

BASE = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("site_dashboard_base", Path(__file__).with_name("fetch_tds.py"))
base = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(base)

SITES = [
    {"host": "well-c.biz", "property": "363826438", "measurement": "G-79C13F9DP5", "file": "well-c-dashboard.html", "tracking": "GA4送信確認済み（2026-08-26）"},
    {"host": "hojokin.well-c.biz", "property": "532590163", "measurement": "G-CKY4MXRRK0", "file": "hojokin-site-dashboard.html", "tracking": "GA4送信確認済み"},
    {"host": "chat.well-c.biz", "property": "363826438", "measurement": "G-79C13F9DP5", "file": "chat-dashboard.html", "tracking": "GA4計測を確認中"},
    {"host": "192office.net", "property": "480292502", "measurement": "G-TH1P40Q03X", "file": "192office-dashboard.html", "tracking": "GA4送信確認済み"},
    {"host": "takuken.fp-1.info", "property": "480292502", "measurement": "G-TH1P40Q03X", "file": "takuken-dashboard.html", "tracking": "GA4送信確認済み"},
    {"host": "hjp2026.fp-1.info", "property": "480292502", "measurement": "G-TH1P40Q03X", "file": "hjp2026-dashboard.html", "tracking": "GA4計測を確認中"},
    {"host": "shouryokuka.fp-1.info", "property": "480292502", "measurement": "G-TH1P40Q03X", "file": "shouryokuka-dashboard.html", "tracking": "GA4送信確認済み（2026-08-27）"},
]


def collect(client):
    daily_report = base.query(client, ["date"], ["activeUsers", "sessions", "screenPageViews", "newUsers", "engagementRate", "averageSessionDuration"])
    daily, totals = [], {"users": 0, "sessions": 0, "pv": 0, "new_users": 0}
    engagement_weighted = duration_weighted = 0.0
    for row in daily_report.rows:
        values = row.metric_values
        users, sessions, pv, new_users = [int(values[i].value or 0) for i in range(4)]
        totals["users"] += users; totals["sessions"] += sessions; totals["pv"] += pv; totals["new_users"] += new_users
        engagement_weighted += float(values[4].value or 0) * sessions
        duration_weighted += float(values[5].value or 0) * sessions
        date = row.dimension_values[0].value
        daily.append({"date": f"{date[:4]}-{date[4:6]}-{date[6:]}", "users": users, "sessions": sessions})
    totals["engagement"] = round(engagement_weighted / totals["sessions"] * 100, 1) if totals["sessions"] else 0
    totals["duration"] = round(duration_weighted / totals["sessions"]) if totals["sessions"] else 0
    pages_report = base.query(client, ["pagePath"], ["screenPageViews", "activeUsers"], 30)
    pages = [{"path": r.dimension_values[0].value, "pv": int(r.metric_values[0].value), "users": int(r.metric_values[1].value)} for r in pages_report.rows]
    channels_report = base.query(client, ["sessionDefaultChannelGroup"], ["sessions", "engagementRate"], 20)
    channels = [{"channel": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value), "engagement": f"{float(r.metric_values[1].value)*100:.1f}%"} for r in channels_report.rows]
    devices_report = base.query(client, ["deviceCategory"], ["sessions"], 10)
    devices = [{"device": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value)} for r in devices_report.rows]
    regions_report = base.query(client, ["region"], ["activeUsers"], 15)
    regions = [{"region": r.dimension_values[0].value, "users": int(r.metric_values[0].value)} for r in regions_report.rows]
    return {"summary": totals, "daily": daily, "pages": pages, "channels": channels, "devices": devices, "regions": regions}


def main():
    client = BetaAnalyticsDataClient(credentials=base.creds())
    for site in SITES:
        base.HOSTNAME = site["host"]
        base.PROPERTY_ID = site["property"]
        base.MEASUREMENT_ID = site["measurement"]
        base.TRACKING_STATUS = site["tracking"]
        data = collect(client)
        out = BASE / site["file"]
        out.write_text(base.build(data), encoding="utf-8")
        print(f'{site["host"]}\t{out.name}\tusers={data["summary"]["users"]}\tpv={data["summary"]["pv"]}')


if __name__ == "__main__":
    main()
