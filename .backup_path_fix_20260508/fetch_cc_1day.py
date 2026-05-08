#!/usr/bin/env python3
"""cc-1day キャンペーン用データ取得スクリプト

GA4 Data API から LP閲覧・CTAクリック・申込ページ閲覧・決済完了を取得
ClickFunnels から注文データを取得
統合して cc-1day-data.json に保存

実行：
    python3 fetch_cc_1day.py

定期実行：launchd で毎日 00:00 実行
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, FilterExpression, Filter,
)

# ============== 設定 ==============
TOKEN_PATH = "/Users/kazuhiroakutsu/.gdoc-uploader/token.json"
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]

# cc-1day 固有の設定
CAMPAIGN = {
    "id": "cc-1day",
    "name": "Claude Code 実装1DAYワークショップ",
    "price": 9800,
    "start": "2026-04-18",
    "end": "2026-04-21T23:59:59+09:00",
    "ga4_property_id": "533735595",  # lp.well-c.biz プロパティ
    "lp_path": "/cc-1day/",
    "order_path": "/cc-1day1",  # funnel-build.com 側
    "thanks_path": "/thanks-cc-1day",
    "cf_product_id": 992927,  # ClickFunnels 製品ID（仮・要確認）
}

OUTPUT_PATH = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed/cc-1day-data.json"


def get_creds():
    """OAuth トークンを読み込み、必要なら更新"""
    if not os.path.exists(TOKEN_PATH):
        sys.exit(f"トークンがありません: {TOKEN_PATH}\n先に auth.py を実行してください")
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        else:
            sys.exit("トークン無効。auth.py を再実行してください")
    return creds


def fetch_ga4_daily(property_id, start_date, end_date):
    """GA4 から日別 PV・CTAクリック・申込ページ閲覧を取得"""
    creds = get_creds()
    client = BetaAnalyticsDataClient(credentials=creds)

    # 日別 PV（ページパス別）
    pv_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date"), Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )
    pv_res = client.run_report(pv_req)

    # cta_click イベント（日別）
    cta_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[Metric(name="eventCount")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="eventName",
                string_filter=Filter.StringFilter(value="cta_click"),
            )
        ),
    )
    cta_res = client.run_report(cta_req)

    # 時間帯別（直近7日）
    hour_req = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="hour")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )
    hour_res = client.run_report(hour_req)

    # 日別集計
    daily_pv = defaultdict(int)
    daily_order_view = defaultdict(int)
    for row in pv_res.rows:
        date = row.dimension_values[0].value  # YYYYMMDD
        path = row.dimension_values[1].value
        views = int(row.metric_values[0].value)
        if CAMPAIGN["lp_path"] in path:
            daily_pv[date] += views
        if CAMPAIGN["order_path"] in path:
            daily_order_view[date] += views

    daily_cta = {row.dimension_values[0].value: int(row.metric_values[0].value)
                 for row in cta_res.rows}

    # 時間帯別
    hourly = [0] * 24
    for row in hour_res.rows:
        h = int(row.dimension_values[0].value)
        hourly[h] = int(row.metric_values[0].value)

    return {"pv": dict(daily_pv), "cta": daily_cta, "order_view": dict(daily_order_view), "hourly": hourly}


def fetch_cf_orders():
    """ClickFunnels から cc-1day 製品の注文データ取得

    現時点では MCP ツール経由で取得するためスタブ。
    本格運用時は CF REST API 直叩き or MCP 経由で注文一覧を取得し、
    日別に集計する。
    """
    # TODO: CF MCP統合
    # MCP のモデル内呼び出しが想定されるので、このスクリプトからは
    # 別ファイル cc-1day-orders.json を読むか、空リストを返す
    orders_file = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed/cc-1day-orders.json"
    if os.path.exists(orders_file):
        with open(orders_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def build_daily(ga4_data, orders):
    """日別データに統合"""
    start = datetime.strptime(CAMPAIGN["start"], "%Y-%m-%d").date()
    end = datetime.strptime(CAMPAIGN["end"][:10], "%Y-%m-%d").date()
    today = datetime.now(timezone(timedelta(hours=9))).date()

    # 決済を日別に集計
    daily_purchase = defaultdict(int)
    daily_revenue = defaultdict(int)
    for o in orders:
        # 期待される形式: {"created_at": "2026-04-18T10:00:00+09:00", "amount": 9800}
        dt = datetime.fromisoformat(o["created_at"].replace("Z", "+00:00"))
        d = dt.astimezone(timezone(timedelta(hours=9))).date()
        key = d.strftime("%Y%m%d")
        daily_purchase[key] += 1
        daily_revenue[key] += o.get("amount", CAMPAIGN["price"])

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
    if CAMPAIGN["ga4_property_id"] is None:
        print("⚠️ GA4_PROPERTY_ID が未設定。GA4データはスキップします。")
        ga4 = {"pv": {}, "cta": {}, "order_view": {}, "hourly": [0]*24}
    else:
        ga4 = fetch_ga4_daily(
            CAMPAIGN["ga4_property_id"],
            CAMPAIGN["start"],
            CAMPAIGN["end"][:10],
        )

    orders = fetch_cf_orders()
    daily, totals = build_daily(ga4, orders)

    now = datetime.now(timezone(timedelta(hours=9)))
    output = {
        "lastUpdate": now.strftime("%Y-%m-%d %H:%M JST"),
        "campaignStart": CAMPAIGN["start"],
        "campaignEnd": CAMPAIGN["end"],
        "product": {"name": CAMPAIGN["name"], "price": CAMPAIGN["price"]},
        "totals": totals,
        "daily": daily,
        "hourly": ga4["hourly"],
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"✅ 出力: {OUTPUT_PATH}")
    print(f"   PV: {totals['pv']} / CTA: {totals['cta']} / 決済: {totals['purchase']} / 売上: ¥{totals['revenue']:,}")


if __name__ == "__main__":
    main()
