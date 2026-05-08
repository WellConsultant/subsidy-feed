#!/usr/bin/env python3
"""全キャンペーンの集約スクリプト

各キャンペーンの {商品}-data.json を読み、
campaigns-overview.json に集約する。

毎日00:00に fetch_*.py の後で実行される想定。
"""

import json
import glob
import os
from collections import defaultdict
from datetime import datetime, timezone, timedelta

SUBSIDY_FEED = "/Users/kazuhiroakutsu/Desktop/claude-skills/subsidy-feed"
OUTPUT_PATH = os.path.join(SUBSIDY_FEED, "campaigns-overview.json")

# キャンペーン設定は campaigns.json から読み込む
CONFIG_PATH = os.path.join(SUBSIDY_FEED, "scripts/analytics/campaigns.json")

def load_campaigns_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    return [
        {"id": c["id"], "data_file": f"{c['id']}-data.json", "dashboard": c["dashboard"]}
        for c in config.get("campaigns", [])
        if c.get("enabled", True)
    ]

CAMPAIGNS = load_campaigns_config()


def load_campaign_data(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def aggregate():
    campaigns = []
    total_pv = total_cta = total_order_view = total_purchase = total_revenue = 0
    day_pattern = defaultdict(lambda: {"purchase": 0, "revenue": 0})  # 何日目集計

    for c in CAMPAIGNS:
        filepath = os.path.join(SUBSIDY_FEED, c["data_file"])
        data = load_campaign_data(filepath)
        if data is None:
            continue

        t = data.get("totals", {})
        total_pv += t.get("pv", 0)
        total_cta += t.get("cta", 0)
        total_order_view += t.get("orderView", 0)
        total_purchase += t.get("purchase", 0)
        total_revenue += t.get("revenue", 0)

        cvr = t.get("purchase", 0) / t.get("pv", 1) * 100 if t.get("pv") else 0
        ctr = t.get("cta", 0) / t.get("pv", 1) * 100 if t.get("pv") else 0

        # 何日目に売れたか集計
        for d in data.get("daily", []):
            day_pattern[d["day"]]["purchase"] += d.get("purchase", 0)
            day_pattern[d["day"]]["revenue"] += d.get("revenue", 0)

        campaigns.append({
            "id": c["id"],
            "name": data.get("product", {}).get("name", c["id"]),
            "start": data.get("campaignStart"),
            "end": data.get("campaignEnd"),
            "dashboard": c["dashboard"],
            "totals": t,
            "cvr": round(cvr, 2),
            "ctr": round(ctr, 2),
            "daily": data.get("daily", []),
        })

    # 何日目パターン（ソート済み）
    day_pattern_list = [
        {"day": k, "purchase": v["purchase"], "revenue": v["revenue"]}
        for k, v in sorted(day_pattern.items())
    ]

    now = datetime.now(timezone(timedelta(hours=9)))
    out = {
        "lastUpdate": now.strftime("%Y-%m-%d %H:%M JST"),
        "campaignCount": len(campaigns),
        "totals": {
            "pv": total_pv,
            "cta": total_cta,
            "orderView": total_order_view,
            "purchase": total_purchase,
            "revenue": total_revenue,
        },
        "campaigns": campaigns,
        "dayPattern": day_pattern_list,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ 出力: {OUTPUT_PATH}")
    print(f"   キャンペーン数: {len(campaigns)} / 累計売上: ¥{total_revenue:,} / 累計決済: {total_purchase}件")


if __name__ == "__main__":
    aggregate()
