#!/usr/bin/env python3
"""風俗営業許可サイト (fp-1.info/hzk-kyoka/) GA4 ダッシュボード生成
プロパティID: 290935699 (G-DW1QE3H0WF)
過去28日間のデータを取得してダッシュボードHTMLを生成する。
launchd から毎日00:30に実行。
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import paramiko

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, FilterExpression,
    Filter
)
StringFilter = Filter.StringFilter

PROPERTY_ID = "290935699"
TOKEN_PATH = "/Users/kazuhiroakutsu/.gdoc-uploader/token.json"
OUT_HTML = "/Users/kazuhiroakutsu/dev/subsidy-feed/hzk-kyoka-dashboard.html"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
PATH_PREFIX = "/hzk-kyoka"

SFTP_HOST = "sv12537.xserver.jp"
SFTP_PORT = 10022
SFTP_USER = "xs161634"
SSH_KEY   = "/Users/kazuhiroakutsu/dev/fueihou-server/keys/xserver_deploy_key"
REMOTE_HTML = "/home/xs161634/fp-1.info/public_html/hzk-kyoka-analytics.html"


def get_creds():
    if not os.path.exists(TOKEN_PATH):
        sys.exit(f"トークンなし: {TOKEN_PATH}")
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_PATH, "w") as f:
                f.write(creds.to_json())
        else:
            sys.exit("トークン無効。auth.py を再実行してください")
    return creds


def run(client, dims, mets, start="28daysAgo", end="today", dim_filter=None):
    req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name=d) for d in dims],
        metrics=[Metric(name=m) for m in mets],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        dimension_filter=dim_filter,
        limit=50,
    )
    return client.run_report(req)


def page_filter():
    return FilterExpression(
        filter=Filter(
            field_name="pagePath",
            string_filter=StringFilter(
                match_type=StringFilter.MatchType.BEGINS_WITH,
                value=PATH_PREFIX,
            ),
        )
    )


def build_html(data: dict) -> str:
    today = datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d")
    start_dt = (datetime.now(timezone(timedelta(hours=9))) - timedelta(days=27)).strftime("%Y-%m-%d")

    daily_js = json.dumps(data["daily"])
    device_js = json.dumps(data["device"])

    top_pages_rows = "".join(
        f'<tr><td>{r["path"]}</td><td>{r["pv"]}</td><td>{r["users"]}</td></tr>'
        for r in data["pages"]
    )
    channel_rows = "".join(
        f'<tr><td>{r["channel"]}</td><td>{r["sessions"]}</td><td>{r["eng"]}%</td></tr>'
        for r in data["channels"]
    )
    region_rows = "".join(
        f'<tr><td>{r["region"]}</td><td>{r["users"]}</td></tr>'
        for r in data["regions"][:15]
    )

    no_data = data["summary"]["users"] == 0
    no_data_note = '<p style="color:#e74c3c;text-align:center;padding:20px">※ 今日設置したばかりのためデータ蓄積中です。明日以降に確認してください。</p>' if no_data else ""

    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>風俗営業許可サイト アナリティクス</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,"Hiragino Sans",sans-serif;background:#f5f7fa;color:#1a1a1a;line-height:1.6}}
.header{{background:#0a2d5e;color:white;padding:20px 32px}}
.header h1{{font-size:20px;font-weight:700}}
.header p{{font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px}}
.container{{max-width:1200px;margin:0 auto;padding:24px 16px}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px}}
.card{{background:white;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}}
.card .label{{font-size:12px;color:#666;letter-spacing:0.5px}}
.card .value{{font-size:28px;font-weight:700;color:#0a2d5e;margin:4px 0}}
.grid-2{{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}}
.grid-3{{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px}}
.panel{{background:white;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}}
.panel h2{{font-size:15px;color:#0a2d5e;margin-bottom:14px;border-bottom:2px solid #e8ecf1;padding-bottom:8px}}
table{{width:100%;border-collapse:collapse;font-size:13px}}
th{{text-align:left;padding:8px 10px;background:#f0f3f7;color:#555;font-weight:600}}
td{{padding:8px 10px;border-bottom:1px solid #eef0f3}}
tr:hover{{background:#f8f9fb}}
canvas{{max-height:300px}}
.section-title{{font-size:18px;font-weight:700;color:#0a2d5e;margin:32px 0 16px;padding-left:12px;border-left:4px solid #e55a1a}}
.empty{{color:#999;font-size:13px;padding:20px;text-align:center}}
@media(max-width:768px){{.grid-2,.grid-3{{grid-template-columns:1fr}}.cards{{grid-template-columns:repeat(2,1fr)}}}}
</style>
</head>
<body>
<div class="header">
  <h1>風俗営業許可サイト (fp-1.info/hzk-kyoka/) アナリティクス</h1>
  <p>期間: {start_dt} 〜 {today}（過去28日間）/ 更新: {today} / プロパティ: G-DW1QE3H0WF ({PROPERTY_ID})</p>
</div>
<div class="container">
{no_data_note}
<div class="section-title">概要</div>
<div class="cards">
  <div class="card"><div class="label">ユーザー数</div><div class="value">{data["summary"]["users"]}</div></div>
  <div class="card"><div class="label">セッション</div><div class="value">{data["summary"]["sessions"]}</div></div>
  <div class="card"><div class="label">PV</div><div class="value">{data["summary"]["pv"]}</div></div>
  <div class="card"><div class="label">新規ユーザー</div><div class="value">{data["summary"]["new_users"]}</div></div>
  <div class="card"><div class="label">エンゲージメント率</div><div class="value">{data["summary"]["eng_rate"]}%</div></div>
  <div class="card"><div class="label">平均セッション時間</div><div class="value">{data["summary"]["avg_duration"]}</div></div>
</div>

<div class="grid-3">
  <div class="panel"><h2>日別ユーザー / セッション推移</h2><canvas id="dailyChart"></canvas></div>
  <div class="panel"><h2>デバイス別セッション</h2><canvas id="deviceChart"></canvas></div>
</div>

<div class="section-title">コンテンツ</div>
<div class="grid-2">
  <div class="panel"><h2>ページ別PV（/hzk-kyoka/ 配下）</h2>
    <table><thead><tr><th>パス</th><th>PV</th><th>ユーザー</th></tr></thead>
    <tbody>{top_pages_rows if top_pages_rows else '<tr><td colspan="3" class="empty">データ蓄積中</td></tr>'}</tbody></table>
  </div>
  <div class="panel"><h2>流入チャネル</h2>
    <table><thead><tr><th>チャネル</th><th>セッション</th><th>エンゲージメント率</th></tr></thead>
    <tbody>{channel_rows if channel_rows else '<tr><td colspan="3" class="empty">データ蓄積中</td></tr>'}</tbody></table>
  </div>
</div>

<div class="section-title">地域</div>
<div class="panel"><h2>地域別ユーザー</h2>
  <table><thead><tr><th>地域</th><th>ユーザー</th></tr></thead>
  <tbody>{region_rows if region_rows else '<tr><td colspan="2" class="empty">データ蓄積中</td></tr>'}</tbody></table>
</div>
</div>

<script>
const dailyData={daily_js};
const deviceData={device_js};
if(dailyData.length>0){{
  new Chart(document.getElementById('dailyChart'),{{
    type:'line',
    data:{{
      labels:dailyData.map(d=>d.date.slice(5)),
      datasets:[
        {{label:'ユーザー',data:dailyData.map(d=>d.users),borderColor:'#0a2d5e',backgroundColor:'rgba(10,45,94,0.1)',fill:true,tension:0.3}},
        {{label:'セッション',data:dailyData.map(d=>d.sessions),borderColor:'#e55a1a',backgroundColor:'transparent',borderDash:[5,3],tension:0.3}}
      ]
    }},
    options:{{responsive:true,plugins:{{legend:{{position:'bottom'}}}}}}
  }})
}}
if(deviceData.length>0){{
  new Chart(document.getElementById('deviceChart'),{{
    type:'doughnut',
    data:{{
      labels:deviceData.map(d=>d.device),
      datasets:[{{data:deviceData.map(d=>d.sessions),backgroundColor:['#0a2d5e','#e55a1a','#27ae60','#2c3e50']}}]
    }},
    options:{{responsive:true,plugins:{{legend:{{position:'bottom'}}}}}}
  }})
}}
</script>
</body></html>"""


def main():
    creds = get_creds()
    client = BetaAnalyticsDataClient(credentials=creds)
    pf = page_filter()

    # --- 概要 ---
    r = run(client, ["date"], ["activeUsers", "sessions", "screenPageViews", "newUsers", "engagementRate", "averageSessionDuration"], dim_filter=pf)
    total_users = total_sessions = total_pv = total_new = 0
    eng_rates = []
    durations = []
    daily = []
    for row in r.rows:
        date = row.dimension_values[0].value
        u = int(row.metric_values[0].value or 0)
        s = int(row.metric_values[1].value or 0)
        pv = int(row.metric_values[2].value or 0)
        nu = int(row.metric_values[3].value or 0)
        er = float(row.metric_values[4].value or 0)
        dur = float(row.metric_values[5].value or 0)
        total_users += u; total_sessions += s; total_pv += pv; total_new += nu
        eng_rates.append(er); durations.append(dur)
        daily.append({"date": f"{date[:4]}-{date[4:6]}-{date[6:]}", "users": u, "sessions": s})
    daily.sort(key=lambda x: x["date"])
    avg_er = round(sum(eng_rates) / len(eng_rates) * 100, 1) if eng_rates else 0
    avg_dur_sec = int(sum(durations) / len(durations)) if durations else 0
    avg_dur = f"{avg_dur_sec // 60}分{avg_dur_sec % 60}秒" if avg_dur_sec >= 60 else f"{avg_dur_sec}秒"

    # --- デバイス ---
    r2 = run(client, ["deviceCategory"], ["sessions"], dim_filter=pf)
    device = [{"device": row.dimension_values[0].value, "sessions": int(row.metric_values[0].value or 0)} for row in r2.rows]

    # --- ページ ---
    r3 = run(client, ["pagePath"], ["screenPageViews", "activeUsers"], dim_filter=pf)
    pages = [{"path": row.dimension_values[0].value, "pv": int(row.metric_values[0].value or 0), "users": int(row.metric_values[1].value or 0)} for row in r3.rows]
    pages.sort(key=lambda x: -x["pv"])

    # --- チャネル ---
    r4 = run(client, ["sessionDefaultChannelGroup"], ["sessions", "engagementRate"], dim_filter=pf)
    channels = [{"channel": row.dimension_values[0].value, "sessions": int(row.metric_values[0].value or 0), "eng": round(float(row.metric_values[1].value or 0) * 100, 1)} for row in r4.rows]
    channels.sort(key=lambda x: -x["sessions"])

    # --- 地域 ---
    r5 = run(client, ["region"], ["activeUsers"], dim_filter=pf)
    regions = [{"region": row.dimension_values[0].value, "users": int(row.metric_values[0].value or 0)} for row in r5.rows]
    regions.sort(key=lambda x: -x["users"])

    data = {
        "summary": {"users": total_users, "sessions": total_sessions, "pv": total_pv, "new_users": total_new, "eng_rate": avg_er, "avg_duration": avg_dur},
        "daily": daily, "device": device, "pages": pages[:30], "channels": channels, "regions": regions,
    }

    html = build_html(data)
    Path(OUT_HTML).write_text(html, encoding="utf-8")
    print(f"HTML生成: {OUT_HTML} / ユーザー={total_users} セッション={total_sessions} PV={total_pv}")

    # Xserverへアップロード
    try:
        transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
        pkey = paramiko.Ed25519Key(filename=SSH_KEY)
        transport.connect(username=SFTP_USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)
        sftp.put(OUT_HTML, REMOTE_HTML)
        sftp.close()
        transport.close()
        print(f"アップロード完了: https://fp-1.info/hzk-kyoka-analytics.html")
    except Exception as e:
        print(f"アップロード失敗: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
