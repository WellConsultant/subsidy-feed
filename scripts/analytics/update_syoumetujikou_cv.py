#!/usr/bin/env python3
"""時効援用サイト分析のCV表示をGA4の送信成功イベントで更新する。"""
import re
from pathlib import Path
from google.oauth2.credentials import Credentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, FilterExpression, Filter

PROPERTY_ID = "534433250"
TOKEN_PATH = "/Users/kazuhiroakutsu/.gdoc-uploader/token.json"
OUT_HTML = Path(__file__).resolve().parents[2] / "syoumetujikou-dashboard.html"

def main():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH)
    client = BetaAnalyticsDataClient(credentials=creds)
    request = RunReportRequest(property=f"properties/{PROPERTY_ID}", dimensions=[Dimension(name="eventName")], metrics=[Metric(name="eventCount")], date_ranges=[DateRange(start_date="28daysAgo", end_date="today")], dimension_filter=FilterExpression(filter=Filter(field_name="eventName", string_filter=Filter.StringFilter(value="generate_lead"))))
    response = client.run_report(request)
    count = sum(int(row.metric_values[0].value or 0) for row in response.rows)
    html = OUT_HTML.read_text(encoding="utf-8")
    html, n1 = re.subn(r'(<div class="label">CV（時効援用問い合わせ送信）</div><div class="value" id="business-inquiry-cv">)\d+(</div>)', rf'\g<1>{count}\g<2>', html, count=1)
    html, n2 = re.subn(r'(<td id="business-inquiry-event-count">)\d+(</td>)', rf'\g<1>{count}\g<2>', html, count=1)
    if n1 != 1 or n2 != 1: raise SystemExit("CV表示の更新箇所が見つからないため停止しました")
    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"generate_lead={count} / {OUT_HTML}")

if __name__ == "__main__": main()
