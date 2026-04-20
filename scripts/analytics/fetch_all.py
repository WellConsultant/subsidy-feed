#!/usr/bin/env python3
"""全キャンペーンのデータ取得（campaigns.json 駆動）

campaigns.json に登録された enabled=true の全キャンペーンについて：
1. GA4 から PV・CTAクリック・申込ページ閲覧を取得
2. ClickFunnels 注文データ（別スクリプトで取得済の {id}-orders.json）を読込
3. {id}-data.json として保存
4. 最後に aggregate_campaigns を呼んで campaigns-overview.json を更新

launchd から毎日00:00に実行される。
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, FilterExpression, Filter,
)

# ============== 設定 ==============
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "campaigns.json")
SUBSIDY_FEED = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed"
TOKEN_PATH = "/Users/kazuhiroakutsu/.gdoc-uploader/token.json"
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_creds():
    if not os.path.exists(TOKEN_PATH):
        sys.exit(f"トークンがありません: {TOKEN_PATH}")
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        else:
            sys.exit("トークン無効。auth.py を再実行してください")
    return creds


def fetch_ga4(client, property_id, campaign):
    """GA4 から日別 PV・CTAクリック・申込ページ閲覧を取得"""
    start = campaign["start"]
    end = campaign["end"][:10]

    pv_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date"), Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start, end_date=end)],
    )
    pv_res = client.run_report(pv_req)

    cta_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[Metric(name="eventCount")],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="eventName",
                string_filter=Filter.StringFilter(value="cta_click"),
            )
        ),
    )
    cta_res = client.run_report(cta_req)

    hour_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="hour")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start, end_date=end)],
    )
    hour_res = client.run_report(hour_req)

    daily_pv = defaultdict(int)
    daily_order_view = defaultdict(int)
    for row in pv_res.rows:
        date = row.dimension_values[0].value
        path = row.dimension_values[1].value
        views = int(row.metric_values[0].value)
        if campaign["lp_path"] in path:
            daily_pv[date] += views
        if campaign["order_path"] in path:
            daily_order_view[date] += views

    daily_cta = {row.dimension_values[0].value: int(row.metric_values[0].value)
                 for row in cta_res.rows}

    hourly = [0] * 24
    for row in hour_res.rows:
        h = int(row.dimension_values[0].value)
        hourly[h] = int(row.metric_values[0].value)

    return {"pv": dict(daily_pv), "cta": daily_cta, "order_view": dict(daily_order_view), "hourly": hourly}


def load_orders(campaign_id):
    path = os.path.join(SUBSIDY_FEED, f"{campaign_id}-orders.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def build_daily(ga4_data, orders, campaign):
    start = datetime.strptime(campaign["start"], "%Y-%m-%d").date()
    end = datetime.strptime(campaign["end"][:10], "%Y-%m-%d").date()
    today = datetime.now(timezone(timedelta(hours=9))).date()

    daily_purchase = defaultdict(int)
    daily_revenue = defaultdict(int)
    for o in orders:
        dt = datetime.fromisoformat(o["created_at"].replace("Z", "+00:00"))
        d = dt.astimezone(timezone(timedelta(hours=9))).date()
        key = d.strftime("%Y%m%d")
        daily_purchase[key] += 1
        daily_revenue[key] += o.get("amount", campaign["price"])

    daily = []
    d = start
    day_n = 1
    while d <= min(end, today):
        key = d.strftime("%Y%m%d")
        daily.append({
            "date": d.strftime("%Y-%m-%d"),
            "day": day_n,
            "pv": ga4_data["pv"].get(key, 0),
            "cta": ga4_data["cta"].get(key, 0),
            "orderView": ga4_data["order_view"].get(key, 0),
            "purchase": daily_purchase.get(key, 0),
            "revenue": daily_revenue.get(key, 0),
        })
        d += timedelta(days=1)
        day_n += 1

    totals = {
        "pv": sum(x["pv"] for x in daily),
        "cta": sum(x["cta"] for x in daily),
        "orderView": sum(x["orderView"] for x in daily),
        "purchase": sum(x["purchase"] for x in daily),
        "revenue": sum(x["revenue"] for x in daily),
    }
    return daily, totals


def main():
    config = load_config()
    creds = get_creds()
    ga4_client = BetaAnalyticsDataClient(credentials=creds)
    property_id = config["ga4_property_id"]

    now = datetime.now(timezone(timedelta(hours=9)))
    processed = 0

    for c in config["campaigns"]:
        if not c.get("enabled", True):
            continue

        print(f"▶ {c['id']} ({c['name']}) 処理中...")
        try:
            ga4 = fetch_ga4(ga4_client, property_id, c)
        except Exception as e:
            print(f"  ⚠ GA4 取得失敗: {e}")
            ga4 = {"pv": {}, "cta": {}, "order_view": {}, "hourly": [0]*24}

        orders = load_orders(c["id"])
        daily, totals = build_daily(ga4, orders, c)

        output = {
            "lastUpdate": now.strftime("%Y-%m-%d %H:%M JST"),
            "campaignStart": c["start"],
            "campaignEnd": c["end"],
            "product": {"name": c["name"], "price": c["price"]},
            "totals": totals,
            "daily": daily,
            "hourly": ga4["hourly"],
        }

        out_path = os.path.join(SUBSIDY_FEED, f"{c['id']}-data.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  ✅ {out_path}")
        print(f"     PV:{totals['pv']} / CTA:{totals['cta']} / 決済:{totals['purchase']} / 売上:¥{totals['revenue']:,}")
        processed += 1

    # 全体集約
    aggregate_script = os.path.join(SCRIPT_DIR, "aggregate_campaigns.py")
    subprocess.run([sys.executable, aggregate_script], check=False)

    print(f"\n🎉 完了（{processed}件のキャンペーンを処理）")


if __name__ == "__main__":
    main()
