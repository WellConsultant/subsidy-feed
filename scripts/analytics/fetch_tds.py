#!/usr/bin/env python3
"""tds.fp-1.info専用のGA4ダッシュボードを生成しXserverへ公開する。"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from html import escape
from pathlib import Path

import paramiko
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Filter, FilterExpression, Metric, RunReportRequest
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

PROPERTY_ID = "480292502"
MEASUREMENT_ID = "G-TH1P40Q03X"
HOSTNAME = "tds.fp-1.info"
TRACKING_STATUS = "GA4計測を確認中"
TOKEN_PATH = "/Users/kazuhiroakutsu/.gdoc-uploader/token.json"
OUT_HTML = "/Users/kazuhiroakutsu/dev/subsidy-feed/tds-analytics.html"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
SFTP_HOST = "sv12537.xserver.jp"
SFTP_PORT = 10022
SFTP_USER = "xs161634"
SSH_KEY = "/Users/kazuhiroakutsu/dev/fueihou-server/keys/xserver_deploy_key"
REMOTE_HTML = "/home/xs161634/fp-1.info/public_html/tds.fp-1.info/analytics.html"


def creds():
    c = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not c.valid and c.expired and c.refresh_token:
        c.refresh(Request())
    if not c.valid:
        sys.exit("Google Analytics認証が無効です")
    return c


def query(client, dimensions, metrics, limit=50):
    host_filter = FilterExpression(filter=Filter(
        field_name="hostName",
        string_filter=Filter.StringFilter(match_type=Filter.StringFilter.MatchType.EXACT, value=HOSTNAME),
    ))
    return client.run_report(RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name=x) for x in dimensions],
        metrics=[Metric(name=x) for x in metrics],
        date_ranges=[DateRange(start_date="28daysAgo", end_date="today")],
        dimension_filter=host_filter,
        limit=limit,
    ))


def rows_html(items, columns, empty_columns):
    if not items:
        return f'<tr><td colspan="{empty_columns}" class="empty">現在はデータ0件</td></tr>'
    return "".join("<tr>" + "".join(f"<td>{escape(str(item[col]))}</td>" for col in columns) + "</tr>" for item in items)


def build(data):
    now = datetime.now(timezone(timedelta(hours=9)))
    today = now.strftime("%Y-%m-%d")
    start = (now - timedelta(days=27)).strftime("%Y-%m-%d")
    pages = rows_html(data["pages"], ["path", "pv", "users"], 3)
    channels = rows_html(data["channels"], ["channel", "sessions", "engagement"], 3)
    regions = rows_html(data["regions"], ["region", "users"], 2)
    daily = json.dumps(data["daily"], ensure_ascii=False)
    devices = json.dumps(data["devices"], ensure_ascii=False)
    s = data["summary"]
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>{HOSTNAME} アナリティクス</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>*{{box-sizing:border-box}}body{{margin:0;font-family:-apple-system,"Hiragino Sans",sans-serif;background:#f4f7fb;color:#172033}}header{{padding:22px 28px;background:#173b63;color:#fff}}header h1{{margin:0;font-size:22px}}header p{{margin:5px 0 0;color:#d7e5f2;font-size:13px}}main{{max-width:1180px;margin:auto;padding:22px 14px}}.status{{margin-bottom:14px;padding:12px 16px;border-radius:10px;background:#ddf6e8;color:#126c3c;font-weight:700}}.status.pending{{background:#fff0c8;color:#805b00}}.cards{{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}}.card,.panel{{background:#fff;border:1px solid #dce4ee;border-radius:12px;padding:18px;box-shadow:0 2px 8px #16355b0c}}.label{{font-size:12px;color:#607086}}.value{{font-size:27px;font-weight:800;color:#173b63}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}}h2{{font-size:16px;margin:0 0 12px}}table{{width:100%;border-collapse:collapse;font-size:13px}}th,td{{padding:9px;border-bottom:1px solid #e6ebf2;text-align:left}}th{{background:#f5f7fa}}canvas{{max-height:280px}}.empty{{color:#7a8798;text-align:center}}@media(max-width:800px){{.cards{{grid-template-columns:repeat(2,1fr)}}.grid{{grid-template-columns:1fr}}}}</style></head><body>
<header><h1>{HOSTNAME} アナリティクス</h1><p>{start}〜{today}（過去28日）／更新 {now.strftime('%Y-%m-%d %H:%M')}／GA4 {MEASUREMENT_ID}</p></header><main>
<div class="status{' pending' if '確認中' in TRACKING_STATUS else ''}">計測状態：{TRACKING_STATUS}</div>
<section class="cards"><div class="card"><div class="label">ユーザー</div><div class="value">{s['users']}</div></div><div class="card"><div class="label">セッション</div><div class="value">{s['sessions']}</div></div><div class="card"><div class="label">PV</div><div class="value">{s['pv']}</div></div><div class="card"><div class="label">新規ユーザー</div><div class="value">{s['new_users']}</div></div><div class="card"><div class="label">エンゲージメント率</div><div class="value">{s['engagement']}%</div></div><div class="card"><div class="label">平均セッション時間</div><div class="value">{s['duration']}秒</div></div></section>
<section class="grid"><div class="panel"><h2>日別ユーザー／セッション</h2><canvas id="daily"></canvas></div><div class="panel"><h2>デバイス別セッション</h2><canvas id="device"></canvas></div></section>
<section class="grid"><div class="panel"><h2>ページ別</h2><table><thead><tr><th>ページ</th><th>PV</th><th>ユーザー</th></tr></thead><tbody>{pages}</tbody></table></div><div class="panel"><h2>流入チャネル</h2><table><thead><tr><th>チャネル</th><th>セッション</th><th>エンゲージメント率</th></tr></thead><tbody>{channels}</tbody></table></div></section>
<section class="grid"><div class="panel"><h2>地域</h2><table><thead><tr><th>地域</th><th>ユーザー</th></tr></thead><tbody>{regions}</tbody></table></div><div class="panel"><h2>確認対象</h2><table><tbody><tr><th>サイト</th><td>https://{HOSTNAME}/</td></tr><tr><th>集計条件</th><td>hostname = {HOSTNAME}</td></tr><tr><th>期間</th><td>過去28日</td></tr></tbody></table></div></section>
<script>const d={daily},v={devices};if(d.length)new Chart(document.getElementById('daily'),{{type:'line',data:{{labels:d.map(x=>x.date.slice(5)),datasets:[{{label:'ユーザー',data:d.map(x=>x.users),borderColor:'#173b63'}},{{label:'セッション',data:d.map(x=>x.sessions),borderColor:'#e37a2d'}}]}}}});if(v.length)new Chart(document.getElementById('device'),{{type:'doughnut',data:{{labels:v.map(x=>x.device),datasets:[{{data:v.map(x=>x.sessions),backgroundColor:['#173b63','#e37a2d','#2f9d6a']}}]}}}});</script></main></body></html>'''


def main():
    client = BetaAnalyticsDataClient(credentials=creds())
    daily_report = query(client, ["date"], ["activeUsers", "sessions", "screenPageViews", "newUsers", "engagementRate", "averageSessionDuration"])
    daily = []
    totals = {"users": 0, "sessions": 0, "pv": 0, "new_users": 0}
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
    page_report = query(client, ["pagePath"], ["screenPageViews", "activeUsers"], 30)
    pages = [{"path": r.dimension_values[0].value, "pv": int(r.metric_values[0].value), "users": int(r.metric_values[1].value)} for r in page_report.rows]
    channel_report = query(client, ["sessionDefaultChannelGroup"], ["sessions", "engagementRate"], 20)
    channels = [{"channel": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value), "engagement": f"{float(r.metric_values[1].value)*100:.1f}%"} for r in channel_report.rows]
    device_report = query(client, ["deviceCategory"], ["sessions"], 10)
    devices = [{"device": r.dimension_values[0].value, "sessions": int(r.metric_values[0].value)} for r in device_report.rows]
    region_report = query(client, ["region"], ["activeUsers"], 15)
    regions = [{"region": r.dimension_values[0].value, "users": int(r.metric_values[0].value)} for r in region_report.rows]
    html = build({"summary": totals, "daily": daily, "pages": pages, "channels": channels, "devices": devices, "regions": regions})
    Path(OUT_HTML).write_text(html, encoding="utf-8")
    transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
    transport.connect(username=SFTP_USER, pkey=paramiko.Ed25519Key(filename=SSH_KEY))
    sftp = paramiko.SFTPClient.from_transport(transport)
    sftp.put(OUT_HTML, REMOTE_HTML)
    sftp.close(); transport.close()
    print(json.dumps({"url": "https://tds.fp-1.info/analytics.html", "summary": totals}, ensure_ascii=False))


if __name__ == "__main__":
    main()
