#!/usr/bin/env python3
"""
모든 시나리오의 JSON 구조를 검증하고 수정하는 스크립트
- aiResponses → aiStrategies 변환
- 누락 필드 보충
- 배터리 분야 시나리오 추가
- legend-13~20 추가
"""
import json
import copy

with open('legendary-scenarios.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

AI_TEMPLATES = {
    "conservative": {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green"},
    "aggressive": {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red"},
    "balanced": {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue"},
}

# aiStrategies가 없는 시나리오에 대한 고유 데이터
AI_STRATEGIES_DATA = {
    "legend-1": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~2턴: 관망", "3턴: 감산 발표에도 관망", "5턴: AI 수혜 확인 후에도 신중", "8턴: 결국 매수 안 함"],
         "result": "지나친 신중 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: 어닝쇼크에 50% 매수", "3턴: 감산 발표에 50% 추가", "5턴: AI 수혜에 홀딩", "8턴: HBM 양산에 환호"],
         "result": "바닥 포착 성공 → +10.5%", "returnRate": "+10.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1~2턴: 관망", "3턴: 감산 발표에 30% 매수", "6턴: 이평선 돌파에 추가 30%", "8턴: 보유 유지"],
         "result": "안정적 수익 → +6.2%", "returnRate": "+6.2%"},
    ],
    "legend-11": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 변동성이 너무 커서 전량 관망", "삼성전자보다 리스크 2배라 판단"],
         "result": "안전 우선 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["2턴: 재고 공포에 50% 매수", "3턴: 감산 발표에 50% 추가", "5턴: AI 수혜 확인 후 홀딩", "8턴: HBM 계약에 환호"],
         "result": "사이클 저점 포착 → +28.5%", "returnRate": "+28.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1~5턴: 관망", "6턴: 기술적 반등 확인 후 100% 매수", "7~8턴: 상승 추세 홀딩"],
         "result": "추세 확인 매수 → +12.8%", "returnRate": "+12.8%"},
    ],
    "legend-12": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 규제 불확실성으로 관망", "소송 결과 확정 후 재검토 계획"],
         "result": "리스크 회피 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: 패소 폭락에 100% 매수", "3~8턴: 홀딩", "클라우드 성장 + AI에 주목"],
         "result": "역발상 매수 성공 → +13.2%", "returnRate": "+13.2%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1~4턴: 관망", "5턴: 클라우드 실적 확인 후 100% 매수", "6~8턴: 홀딩"],
         "result": "실적 확인 후 진입 → +10.5%", "returnRate": "+10.5%"},
    ],
    "legend-21": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 방산주 윤리적 부담으로 관망", "다른 섹터 투자 검토"],
         "result": "가치관 우선 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: 지정학 긴장에 100% 매수", "2턴: 폴란드 계약에 환호", "4턴: 조정에도 홀딩", "8턴: 수주 잔고에 만족"],
         "result": "초기 진입 대박 → +48.5%", "returnRate": "+48.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1턴: 관망", "2턴: 폴란드 계약 확인 후 100% 매수", "4턴: 조정에도 홀딩", "8턴: 수주 확인"],
         "result": "계약 확인 후 안정 진입 → +35.2%", "returnRate": "+35.2%"},
    ],
    "legend-22": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 방산주 변동성 부담으로 관망"],
         "result": "관망 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: 관망", "4턴: 기술유출 폭락에 100% 매수", "5턴: 해명 반등 확인", "8턴: 수주 잔고에 만족"],
         "result": "공포 속 매수 → +42.5%", "returnRate": "+42.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1턴: 예산 증액에 100% 매수", "3턴: 실적 확인 후 홀딩", "4턴: 기술유출 조정에도 보유", "8턴: 장기 보유"],
         "result": "예산 증액 기반 매수 → +38.2%", "returnRate": "+38.2%"},
    ],
    "legend-23": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 증권주 사이클 변동성 커서 관망"],
         "result": "관망 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: 거래대금 급증에 100% 매수", "4턴: 조정에도 홀딩", "8턴: 거래대금 30조에 환호"],
         "result": "초기 진입 대박 → +42.5%", "returnRate": "+42.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1~2턴: 관망", "3턴: 실적 확인 후 100% 매수", "4턴: 조정에도 보유", "8턴: 추가 상승"],
         "result": "실적 확인 후 진입 → +28.8%", "returnRate": "+28.8%"},
    ],
    "legend-24": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: IPO 시장 리스크 커서 관망"],
         "result": "관망 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1턴: IPO 주관 확정에 100% 매수", "4턴: IPO 침체에도 홀딩", "8턴: IB 1위 달성에 만족"],
         "result": "초기 진입 성공 → +42.8%", "returnRate": "+42.8%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1~2턴: 관망", "3턴: IB 수익 3배 확인 후 매수", "4턴: 침체에도 보유", "8턴: 장기 보유"],
         "result": "실적 확인 후 진입 → +22.5%", "returnRate": "+22.5%"},
    ],
    "legend-25": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 소형주 변동성 너무 커서 관망"],
         "result": "리스크 회피 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1~3턴: 관망", "4턴: 경기둔화 폭락에 100% 매수", "5~8턴: 반등 홀딩"],
         "result": "저점 포착 대박 → +68.5%", "returnRate": "+68.5%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1턴: 설비투자 확대에 100% 매수", "4턴: 경기둔화에 동요하지만 홀딩", "8턴: 수주잔고 1조에 만족"],
         "result": "설비투자 기반 진입 → +58.2%", "returnRate": "+58.2%"},
    ],
    "legend-26": [
        {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green",
         "actions": ["1~8턴: 소형 장비주 변동성 너무 커서 관망"],
         "result": "리스크 회피 → 0%", "returnRate": "0%"},
        {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red",
         "actions": ["1~3턴: 관망", "4턴: BOE 발주 취소 폭락에 100% 매수", "5턴: LG 발주 반등 확인", "8턴: 수주잔고에 만족"],
         "result": "공포 속 매수 대박 → +85.2%", "returnRate": "+85.2%"},
        {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue",
         "actions": ["1턴: OLED 투자확대에 100% 매수", "4턴: BOE 취소에 패닉하지만 홀딩", "6턴: 애플 OLED에 안도", "8턴: 수주 확인"],
         "result": "초기 진입 + 인내 → +62.8%", "returnRate": "+62.8%"},
    ],
}

# ==============================================================
# 신규 시나리오 추가 (legend-13 ~ legend-20 + 배터리 2개)
# ==============================================================
NEW_SCENARIOS = [
    {
        "id": "legend-13", "order": 13,
        "title": "알테오젠, 기술수출 계약 해지",
        "subtitle": "한 방에 승부가 갈리는 바이오",
        "emoji": "🧪", "category": "임상 리스크",
        "difficulty": 4, "difficultyLabel": "고급",
        "gradientFrom": "from-purple-500", "gradientTo": "to-pink-600",
        "stock": {"name": "알테오젠", "code": "196170", "sector": "바이오", "initialPrice": 125000},
        "description": "알테오젠이 글로벌 제약사와 맺은 기술수출 계약이 해지될 위기입니다. 바이오는 한 방에 승부가 갈립니다.",
        "keyLesson": "바이오는 계약 성공/실패에 따라 ±50% 변동!",
        "survivalTip": "파이프라인이 다각화된 바이오가 안전합니다.",
        "tags": ["알테오젠", "바이오", "기술수출", "고위험"],
        "events": [
            {"turn": 1, "title": "계약 해지 가능성 보도", "description": "글로벌 제약사가 알테오젠과의 기술수출 계약을 재검토 중이라는 보도. 주가 -12.5% 폭락!", "priceChange": "-12.5%", "sentiment": "shock"},
            {"turn": 2, "title": "회사 \"협의 중\" 해명", "description": "알테오젠이 \"계약 조건 재협의 중\"이라고 해명. 하지만 불확실성에 -8.3% 추가 하락.", "priceChange": "-8.3%", "sentiment": "negative"},
            {"turn": 3, "title": "신규 파이프라인 발표", "description": "알테오젠이 새로운 바이오베터 파이프라인을 발표. 다각화 기대감에 +6.5% 반등.", "priceChange": "+6.5%", "sentiment": "positive"},
            {"turn": 4, "title": "계약 해지 확정", "description": "결국 글로벌 제약사가 계약 해지를 공식 발표. 주가 -15.2% 폭락. 바이오의 리스크가 현실화!", "priceChange": "-15.2%", "sentiment": "shock"},
            {"turn": 5, "title": "국내 제약사와 신규 계약", "description": "알테오젠이 국내 대형 제약사와 신규 기술수출 계약 체결! +18.5% 급등. 위기를 기회로!", "priceChange": "+18.5%", "sentiment": "positive"},
            {"turn": 6, "title": "임상 3상 성공", "description": "신규 파이프라인의 임상 3상이 성공. FDA 허가 기대감에 +12.3% 급등.", "priceChange": "+12.3%", "sentiment": "positive"},
            {"turn": 7, "title": "글로벌 제약사 재접촉", "description": "계약 해지했던 글로벌 제약사가 재협의 의사 타진. +8.7% 상승.", "priceChange": "+8.7%", "sentiment": "positive"},
            {"turn": 8, "title": "FDA 허가 획득", "description": "신규 파이프라인이 FDA 허가 획득! +15.2% 급등하며 저점 대비 +50% 회복.", "priceChange": "+15.2%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s13-1", "title": "계약 해지 후 매수", "emoji": "🎯", "description": "최악의 상황 후 반등 노리기", "steps": ["1~4턴: 관망", "4턴: 해지 확정 후 50% 매수", "5턴: 신규 계약 후 50% 추가"], "risk": "높음", "expectedReturn": "+40% ~ +60%", "difficulty": 5},
            {"id": "s13-2", "title": "신규 계약 확인 후 매수", "emoji": "📊", "description": "리스크 해소 후 안전 매수", "steps": ["1~4턴: 관망", "5턴: 신규 계약 확인 후 100% 매수"], "risk": "보통", "expectedReturn": "+30% ~ +40%", "difficulty": 4},
            {"id": "s13-3", "title": "바이오 리스크 회피", "emoji": "🛡️", "description": "변동성이 너무 커서 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 바이오 리스크 너무 커서 관망", "안전한 다른 종목 탐색"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1~3턴: 관망", "4턴: 계약 해지 폭락에 50% 매수", "5턴: 신규 계약에 50% 추가", "8턴: FDA 허가에 환호"], "result": "공포 속 매수 대박 → +52.3%", "returnRate": "+52.3%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: 신규 계약 확인 후 100% 매수", "6~8턴: 홀딩"], "result": "리스크 해소 후 진입 → +35.8%", "returnRate": "+35.8%"}
        ],
        "stats": {"avgClearRate": 55, "avgSurvivalRate": 65, "bestStrategy": "계약 해지 후 매수"}
    },
    {
        "id": "legend-14", "order": 14,
        "title": "테슬라, 머스크 리스크 폭발",
        "subtitle": "트윗 한 줄에 ±10% 변동",
        "emoji": "⚡", "category": "경영자 리스크",
        "difficulty": 4, "difficultyLabel": "고급",
        "gradientFrom": "from-green-500", "gradientTo": "to-teal-600",
        "stock": {"name": "테슬라", "code": "TSLA", "sector": "전기차", "initialPrice": 245},
        "description": "일론 머스크의 트윗 한 줄에 테슬라 주가가 ±10% 변동합니다. 머스크 리스크를 견딜 수 있나요?",
        "keyLesson": "경영자 리스크는 단기 변동성일 뿐, 본질은 사업!",
        "survivalTip": "트윗에 흔들리지 말고 생산량과 인도량을 보세요.",
        "tags": ["테슬라", "머스크", "고변동성", "EV"],
        "events": [
            {"turn": 1, "title": "머스크 트위터 인수 발표", "description": "일론 머스크가 트위터 인수에 440억 달러를 쓰겠다고 발표. 테슬라 주식 매각 우려에 -9.2% 폭락!", "priceChange": "-9.2%", "sentiment": "shock"},
            {"turn": 2, "title": "중국 공장 생산 차질", "description": "상하이 공장이 코로나 봉쇄로 3주간 가동 중단. -6.5% 하락. 인도량 감소 우려.", "priceChange": "-6.5%", "sentiment": "negative"},
            {"turn": 3, "title": "가격 인하 발표", "description": "테슬라가 전 모델 가격을 5~10% 인하. 수요 확대 기대감에 +7.8% 반등.", "priceChange": "+7.8%", "sentiment": "positive"},
            {"turn": 4, "title": "머스크 \"테슬라에 집중\" 트윗", "description": "머스크가 \"테슬라에 다시 집중하겠다\"고 트윗. +5.2% 상승. 트윗 한 줄의 위력!", "priceChange": "+5.2%", "sentiment": "positive"},
            {"turn": 5, "title": "분기 인도량 신기록", "description": "테슬라가 분기 인도량 48만대로 신기록 달성! +11.5% 급등. 본질은 실적!", "priceChange": "+11.5%", "sentiment": "positive"},
            {"turn": 6, "title": "FSD 베타 출시", "description": "완전자율주행(FSD) 베타 버전 출시. AI 기술력 입증에 +8.3% 상승.", "priceChange": "+8.3%", "sentiment": "positive"},
            {"turn": 7, "title": "멕시코 공장 착공", "description": "테슬라가 멕시코에 신규 기가팩토리 착공. 생산능력 확대 기대감에 +6.7% 상승.", "priceChange": "+6.7%", "sentiment": "positive"},
            {"turn": 8, "title": "AI 로봇 \"옵티머스\" 공개", "description": "테슬라가 AI 휴머노이드 로봇 공개. 미래 성장성 기대감에 +9.2% 급등!", "priceChange": "+9.2%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s14-1", "title": "머스크 리스크 저점 매수", "emoji": "🎯", "description": "트윗 폭락 시 매수", "steps": ["1턴: 트윗 폭락에 50% 매수", "3턴: 가격 인하 후 50% 추가"], "risk": "높음", "expectedReturn": "+35% ~ +50%", "difficulty": 5},
            {"id": "s14-2", "title": "실적 확인 후 매수", "emoji": "📊", "description": "인도량 신기록 후 매수", "steps": ["1~4턴: 관망", "5턴: 인도량 신기록 후 100% 매수"], "risk": "보통", "expectedReturn": "+25% ~ +35%", "difficulty": 4},
            {"id": "s14-3", "title": "머스크 리스크 회피", "emoji": "🛡️", "description": "변동성이 너무 커서 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 머스크 리스크 너무 커서 관망", "변동성 견딜 자신 없음"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1턴: 트위터 인수 폭락에 50% 매수", "3턴: 가격 인하에 50% 추가", "5~8턴: 홀딩"], "result": "역발상 대박 → +45.8%", "returnRate": "+45.8%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: 인도량 신기록 확인 후 100% 매수", "6~8턴: 홀딩"], "result": "실적 확인 후 진입 → +28.5%", "returnRate": "+28.5%"}
        ],
        "stats": {"avgClearRate": 60, "avgSurvivalRate": 70, "bestStrategy": "머스크 리스크 저점 매수"}
    },
    {
        "id": "legend-15", "order": 15,
        "title": "메타, AI 전환 성공할까?",
        "subtitle": "메타버스 실패 후 AI 도전",
        "emoji": "🤖", "category": "사업 전환",
        "difficulty": 3, "difficultyLabel": "중급",
        "gradientFrom": "from-cyan-500", "gradientTo": "to-blue-600",
        "stock": {"name": "메타(페이스북)", "code": "META", "sector": "플랫폼", "initialPrice": 325},
        "description": "메타가 메타버스에 10조원을 날리고 이제 AI로 전환 중입니다. 성공할 수 있을까요?",
        "keyLesson": "사업 전환은 시간이 걸립니다. 인내가 필요!",
        "survivalTip": "광고 수익 회복과 AI 투자 성과를 동시에 봐야 합니다.",
        "tags": ["메타", "AI", "전환", "광고"],
        "events": [
            {"turn": 1, "title": "메타버스 부문 10조원 손실", "description": "메타가 메타버스 부문에서 10조원 손실을 발표. 주가 -7.8% 폭락!", "priceChange": "-7.8%", "sentiment": "shock"},
            {"turn": 2, "title": "대규모 구조조정 발표", "description": "메타가 1만명 감원 발표. 비용 절감 기대감에 +4.2% 반등.", "priceChange": "+4.2%", "sentiment": "positive"},
            {"turn": 3, "title": "AI 투자 확대 선언", "description": "저커버그가 \"AI에 집중 투자\"를 선언. 하지만 비용 증가 우려에 -2.5% 하락.", "priceChange": "-2.5%", "sentiment": "negative"},
            {"turn": 4, "title": "광고 수익 회복", "description": "분기 광고 수익이 예상을 뛰어넘음. +6.8% 상승.", "priceChange": "+6.8%", "sentiment": "positive"},
            {"turn": 5, "title": "AI 챗봇 \"Meta AI\" 출시", "description": "메타가 AI 챗봇 출시. 인스타그램·왓츠앱 통합. +8.5% 급등!", "priceChange": "+8.5%", "sentiment": "positive"},
            {"turn": 6, "title": "AI 광고 타겟팅 개선", "description": "AI 기반 광고 타겟팅으로 광고 효율 30% 개선. +5.2% 상승.", "priceChange": "+5.2%", "sentiment": "positive"},
            {"turn": 7, "title": "자사주 매입 확대", "description": "메타가 자사주 매입을 500억 달러로 확대. +4.5% 상승.", "priceChange": "+4.5%", "sentiment": "positive"},
            {"turn": 8, "title": "AI 수익 모델 확정", "description": "메타가 AI 구독 서비스로 수익화 성공. +6.3% 급등.", "priceChange": "+6.3%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s15-1", "title": "메타버스 실패 후 매수", "emoji": "🎯", "description": "최악의 상황 후 반등", "steps": ["1턴: 메타버스 손실 후 100% 매수", "2~8턴: 홀딩"], "risk": "높음", "expectedReturn": "+30% ~ +40%", "difficulty": 4},
            {"id": "s15-2", "title": "AI 성과 확인 후 매수", "emoji": "📊", "description": "AI 출시 후 안전 매수", "steps": ["1~4턴: 관망", "5턴: AI 출시 후 100% 매수"], "risk": "보통", "expectedReturn": "+20% ~ +25%", "difficulty": 3},
            {"id": "s15-3", "title": "전환 리스크 회피", "emoji": "🛡️", "description": "성공 확정까지 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 전환 리스크 해소 때까지 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1턴: 메타버스 손실 폭락에 100% 매수", "2~8턴: 전량 홀딩"], "result": "바닥 매수 성공 → +35.2%", "returnRate": "+35.2%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: AI 출시 확인 후 100% 매수", "6~8턴: 홀딩"], "result": "AI 확인 후 안전 진입 → +22.8%", "returnRate": "+22.8%"}
        ],
        "stats": {"avgClearRate": 70, "avgSurvivalRate": 80, "bestStrategy": "메타버스 실패 후 매수"}
    },
    {
        "id": "legend-16", "order": 16,
        "title": "엔비디아, AI 버블인가 혁명인가?",
        "subtitle": "PER 100배의 진실",
        "emoji": "🚀", "category": "밸류에이션",
        "difficulty": 4, "difficultyLabel": "고급",
        "gradientFrom": "from-orange-500", "gradientTo": "to-red-600",
        "stock": {"name": "엔비디아", "code": "NVDA", "sector": "AI 반도체", "initialPrice": 485},
        "description": "엔비디아의 PER이 100배입니다. AI 혁명인가, 버블인가? 당신의 판단은?",
        "keyLesson": "고밸류에이션도 성장이 뒷받침되면 정당화됩니다!",
        "survivalTip": "GPU 공급 부족과 수요를 보면 답이 보입니다.",
        "tags": ["엔비디아", "AI", "고밸류", "GPU"],
        "events": [
            {"turn": 1, "title": "실적 발표, 매출 3배 급증", "description": "엔비디아가 AI GPU 수요 폭증으로 매출 3배 증가 발표! 하지만 PER 100배 부담에 +2.5%만 상승.", "priceChange": "+2.5%", "sentiment": "positive"},
            {"turn": 2, "title": "중국 수출 규제 강화", "description": "미국이 중국 AI 칩 수출 규제 강화. 매출 20% 타격 우려에 -8.5% 폭락.", "priceChange": "-8.5%", "sentiment": "shock"},
            {"turn": 3, "title": "신제품 \"H200\" 발표", "description": "엔비디아가 차세대 AI 칩 H200 발표. 성능 2배 향상에 +11.2% 급등!", "priceChange": "+11.2%", "sentiment": "positive"},
            {"turn": 4, "title": "AMD 경쟁 제품 출시", "description": "AMD가 엔비디아 경쟁 AI 칩 출시. 시장 점유율 우려에 -5.8% 하락.", "priceChange": "-5.8%", "sentiment": "negative"},
            {"turn": 5, "title": "마이크로소프트 대량 주문", "description": "MS가 AI 데이터센터용 GPU 100억 달러 주문! +9.5% 급등.", "priceChange": "+9.5%", "sentiment": "positive"},
            {"turn": 6, "title": "공급 부족 1년 대기", "description": "GPU 공급 부족으로 주문 후 1년 대기. 수요 폭발 확인에 +7.8% 상승.", "priceChange": "+7.8%", "sentiment": "positive"},
            {"turn": 7, "title": "TSMC 생산능력 확대", "description": "TSMC가 엔비디아 GPU 생산능력 2배 확대. +6.2% 상승.", "priceChange": "+6.2%", "sentiment": "positive"},
            {"turn": 8, "title": "AI 슈퍼사이클 확정", "description": "애널리스트들이 \"AI 슈퍼사이클 시작\"이라고 평가. +8.5% 급등.", "priceChange": "+8.5%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s16-1", "title": "규제 리스크 저점 매수", "emoji": "🎯", "description": "중국 규제 폭락 시 매수", "steps": ["1턴: 관망", "2턴: 규제 폭락에 100% 매수"], "risk": "높음", "expectedReturn": "+40% ~ +55%", "difficulty": 5},
            {"id": "s16-2", "title": "수요 확인 후 매수", "emoji": "📊", "description": "대량 주문 확인 후 매수", "steps": ["1~4턴: 관망", "5턴: MS 주문 후 100% 매수"], "risk": "보통", "expectedReturn": "+25% ~ +35%", "difficulty": 4},
            {"id": "s16-3", "title": "고밸류 리스크 회피", "emoji": "🛡️", "description": "PER 100배는 너무 부담", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: PER 100배 부담으로 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1턴: 관망", "2턴: 규제 폭락에 100% 매수", "3~8턴: 홀딩"], "result": "규제 폭락 매수 대박 → +48.5%", "returnRate": "+48.5%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: MS 주문 확인 후 100% 매수", "6~8턴: 홀딩"], "result": "수요 확인 후 안전 진입 → +28.8%", "returnRate": "+28.8%"}
        ],
        "stats": {"avgClearRate": 58, "avgSurvivalRate": 68, "bestStrategy": "규제 리스크 저점 매수"}
    },
    {
        "id": "legend-17", "order": 17,
        "title": "KT&G, 담뱃세 인상 쇼크",
        "subtitle": "독점 사업의 정책 리스크",
        "emoji": "🏛️", "category": "정책 리스크",
        "difficulty": 2, "difficultyLabel": "초급",
        "gradientFrom": "from-slate-500", "gradientTo": "to-gray-600",
        "stock": {"name": "KT&G", "code": "033780", "sector": "담배", "initialPrice": 82000},
        "description": "KT&G는 담배 독점 기업이지만 정부가 담뱃세를 올리면 수익이 줄어듭니다.",
        "keyLesson": "정책 뉴스와 실제 영향을 빠르게 구분하세요!",
        "survivalTip": "담뱃세 인상은 단기 악재, 장기적으로는 회복합니다.",
        "tags": ["KT&G", "담배", "정책", "규제"],
        "events": [
            {"turn": 1, "title": "담뱃세 인상 추진 보도", "description": "정부가 담뱃세 2,000원 인상을 추진 중이라는 보도. -6.5% 폭락!", "priceChange": "-6.5%", "sentiment": "shock"},
            {"turn": 2, "title": "업계 반발, 국회 논의", "description": "담배 업계 강력 반발. 국회 논의 시작. -2.3% 추가 하락.", "priceChange": "-2.3%", "sentiment": "negative"},
            {"turn": 3, "title": "인상 폭 축소 가능성", "description": "담뱃세 인상 폭이 1,000원으로 축소될 가능성. +3.8% 반등.", "priceChange": "+3.8%", "sentiment": "positive"},
            {"turn": 4, "title": "국회 통과 유예", "description": "국회에서 담뱃세 인상안 통과 유예 결정. +4.2% 상승.", "priceChange": "+4.2%", "sentiment": "positive"},
            {"turn": 5, "title": "해외 사업 호조", "description": "KT&G의 해외 담배 사업이 호조. 수출 증가에 +2.5% 상승.", "priceChange": "+2.5%", "sentiment": "positive"},
            {"turn": 6, "title": "배당 확대 발표", "description": "KT&G가 배당을 20% 확대 발표. 배당 매력에 +3.2% 상승.", "priceChange": "+3.2%", "sentiment": "positive"},
            {"turn": 7, "title": "궐련형 전자담배 성장", "description": "궐련형 전자담배 \"릴\" 판매량 급증. +2.8% 상승.", "priceChange": "+2.8%", "sentiment": "positive"},
            {"turn": 8, "title": "정책 리스크 해소", "description": "정부가 담뱃세 인상 계획 철회. +4.5% 급등.", "priceChange": "+4.5%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s17-1", "title": "정책 리스크 저점 매수", "emoji": "🎯", "description": "담뱃세 보도 시 매수", "steps": ["1턴: 인상 보도에 100% 매수", "2~8턴: 홀딩"], "risk": "보통", "expectedReturn": "+15% ~ +20%", "difficulty": 3},
            {"id": "s17-2", "title": "유예 확인 후 매수", "emoji": "📊", "description": "국회 유예 후 매수", "steps": ["1~3턴: 관망", "4턴: 유예 확인 후 100% 매수"], "risk": "낮음", "expectedReturn": "+10% ~ +15%", "difficulty": 2},
            {"id": "s17-3", "title": "정책 리스크 회피", "emoji": "🛡️", "description": "해소까지 관망", "steps": ["1~8턴: 전량 관망"], "risk": "매우 낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 정책 리스크 해소 때까지 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1턴: 담뱃세 보도 폭락에 100% 매수", "2~8턴: 홀딩"], "result": "역발상 매수 → +18.2%", "returnRate": "+18.2%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~3턴: 관망", "4턴: 유예 확인 후 100% 매수", "5~8턴: 홀딩"], "result": "유예 확인 후 진입 → +12.5%", "returnRate": "+12.5%"}
        ],
        "stats": {"avgClearRate": 78, "avgSurvivalRate": 88, "bestStrategy": "정책 리스크 저점 매수"}
    },
    {
        "id": "legend-18", "order": 18,
        "title": "코인베이스, 비트코인과 동행",
        "subtitle": "암호화폐 거래소의 운명",
        "emoji": "🪙", "category": "테마주",
        "difficulty": 4, "difficultyLabel": "고급",
        "gradientFrom": "from-red-500", "gradientTo": "to-pink-600",
        "stock": {"name": "코인베이스", "code": "COIN", "sector": "암호화폐", "initialPrice": 125},
        "description": "코인베이스는 비트코인이 오르면 같이 오르고, 떨어지면 같이 떨어집니다.",
        "keyLesson": "테마주는 본질(비트코인 가격)을 보세요!",
        "survivalTip": "비트코인 차트를 보면 코인베이스가 보입니다.",
        "tags": ["코인베이스", "비트코인", "테마", "고변동성"],
        "events": [
            {"turn": 1, "title": "비트코인 -15% 폭락", "description": "비트코인이 -15% 폭락하며 암호화폐 시장 패닉. 코인베이스 -18.5% 폭락!", "priceChange": "-18.5%", "sentiment": "shock"},
            {"turn": 2, "title": "SEC 규제 조사 착수", "description": "미국 SEC가 코인베이스 규제 조사 착수. -12.3% 추가 폭락.", "priceChange": "-12.3%", "sentiment": "shock"},
            {"turn": 3, "title": "비트코인 반등 +10%", "description": "비트코인이 +10% 반등. 코인베이스도 +15.2% 급등!", "priceChange": "+15.2%", "sentiment": "positive"},
            {"turn": 4, "title": "거래량 급감, 실적 악화", "description": "암호화폐 거래량 급감으로 수수료 수익 -40%. -8.5% 하락.", "priceChange": "-8.5%", "sentiment": "negative"},
            {"turn": 5, "title": "비트코인 ETF 승인", "description": "미국에서 비트코인 현물 ETF 승인! +22.5% 급등!", "priceChange": "+22.5%", "sentiment": "positive"},
            {"turn": 6, "title": "기관 투자자 유입", "description": "ETF 승인으로 기관 투자자 대거 유입. +12.8% 상승.", "priceChange": "+12.8%", "sentiment": "positive"},
            {"turn": 7, "title": "비트코인 신고가", "description": "비트코인이 사상 최고가 경신! +18.5% 급등!", "priceChange": "+18.5%", "sentiment": "positive"},
            {"turn": 8, "title": "수수료 수익 회복", "description": "거래량 폭증으로 수수료 수익 3배 증가. +15.2% 급등!", "priceChange": "+15.2%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s18-1", "title": "패닉 저점 매수", "emoji": "🎯", "description": "비트코인 폭락 시 매수", "steps": ["1~2턴: SEC 조사 폭락에 100% 매수", "3~8턴: 홀딩"], "risk": "높음", "expectedReturn": "+80% ~ +120%", "difficulty": 5},
            {"id": "s18-2", "title": "ETF 승인 후 매수", "emoji": "📊", "description": "규제 해소 후 매수", "steps": ["1~4턴: 관망", "5턴: ETF 승인 후 100% 매수"], "risk": "보통", "expectedReturn": "+50% ~ +70%", "difficulty": 4},
            {"id": "s18-3", "title": "암호화폐 리스크 회피", "emoji": "🛡️", "description": "변동성 너무 커서 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 암호화폐 리스크 너무 커서 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["2턴: SEC 조사 폭락에 100% 매수", "3~8턴: 전량 홀딩"], "result": "패닉 매수 대박 → +95.8%", "returnRate": "+95.8%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: ETF 승인 후 100% 매수", "6~8턴: 홀딩"], "result": "ETF 확인 후 진입 → +58.5%", "returnRate": "+58.5%"}
        ],
        "stats": {"avgClearRate": 50, "avgSurvivalRate": 60, "bestStrategy": "패닉 저점 매수"}
    },
    {
        "id": "legend-19", "order": 19,
        "title": "노벨리스, 중국 경기 직격탄",
        "subtitle": "알루미늄 가격과 100% 연동",
        "emoji": "🌐", "category": "원자재",
        "difficulty": 3, "difficultyLabel": "중급",
        "gradientFrom": "from-amber-500", "gradientTo": "to-yellow-600",
        "stock": {"name": "노벨리스(알루미늄)", "code": "NVL", "sector": "원자재", "initialPrice": 68},
        "description": "노벨리스는 알루미늄 가격과 100% 연동됩니다. 중국 경기에 직격탄.",
        "keyLesson": "원자재주는 글로벌 경기 지표를 보세요!",
        "survivalTip": "중국 PMI 지표를 보면 미래가 보입니다.",
        "tags": ["알루미늄", "원자재", "중국", "경기민감"],
        "events": [
            {"turn": 1, "title": "중국 부동산 경기 악화", "description": "중국 부동산 경기가 급격히 악화. 알루미늄 수요 급감 우려에 -9.5% 폭락!", "priceChange": "-9.5%", "sentiment": "shock"},
            {"turn": 2, "title": "알루미늄 가격 -12% 하락", "description": "알루미늄 현물가가 -12% 폭락. -7.8% 추가 하락.", "priceChange": "-7.8%", "sentiment": "negative"},
            {"turn": 3, "title": "중국 경기 부양책 발표", "description": "중국 정부가 대규모 경기 부양책 발표. +8.5% 반등!", "priceChange": "+8.5%", "sentiment": "positive"},
            {"turn": 4, "title": "미국 경기 침체 우려", "description": "미국 제조업 PMI 급락. 경기 침체 우려에 -5.2% 하락.", "priceChange": "-5.2%", "sentiment": "negative"},
            {"turn": 5, "title": "전기차 수요 증가", "description": "전기차 경량화로 알루미늄 수요 급증. +6.8% 상승.", "priceChange": "+6.8%", "sentiment": "positive"},
            {"turn": 6, "title": "알루미늄 가격 반등", "description": "알루미늄 현물가 +15% 반등. +9.2% 급등!", "priceChange": "+9.2%", "sentiment": "positive"},
            {"turn": 7, "title": "중국 PMI 회복", "description": "중국 제조업 PMI가 50 돌파. +5.5% 상승.", "priceChange": "+5.5%", "sentiment": "positive"},
            {"turn": 8, "title": "글로벌 경기 회복", "description": "글로벌 제조업 PMI 일제히 상승. +7.2% 급등.", "priceChange": "+7.2%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s19-1", "title": "경기 저점 매수", "emoji": "🎯", "description": "부양책 발표 시 매수", "steps": ["1~2턴: 관망", "3턴: 부양책 발표에 100% 매수"], "risk": "높음", "expectedReturn": "+25% ~ +35%", "difficulty": 4},
            {"id": "s19-2", "title": "가격 반등 확인 후 매수", "emoji": "📊", "description": "알루미늄 반등 후 매수", "steps": ["1~5턴: 관망", "6턴: 가격 반등 후 100% 매수"], "risk": "보통", "expectedReturn": "+15% ~ +20%", "difficulty": 3},
            {"id": "s19-3", "title": "경기 리스크 회피", "emoji": "🛡️", "description": "경기 회복 확정까지 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 경기 리스크 해소 때까지 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1~2턴: 관망", "3턴: 부양책 발표에 100% 매수", "4~8턴: 홀딩"], "result": "부양책 매수 → +28.5%", "returnRate": "+28.5%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~5턴: 관망", "6턴: 가격 반등 확인 후 100% 매수", "7~8턴: 홀딩"], "result": "반등 확인 후 진입 → +18.2%", "returnRate": "+18.2%"}
        ],
        "stats": {"avgClearRate": 65, "avgSurvivalRate": 75, "bestStrategy": "경기 저점 매수"}
    },
    {
        "id": "legend-20", "order": 20,
        "title": "삼성생명, 금리 역전의 공포",
        "subtitle": "보험사의 금리 리스크",
        "emoji": "🏦", "category": "금리 리스크",
        "difficulty": 3, "difficultyLabel": "중급",
        "gradientFrom": "from-emerald-500", "gradientTo": "to-green-600",
        "stock": {"name": "삼성생명", "code": "032830", "sector": "보험", "initialPrice": 78000},
        "description": "삼성생명은 금리가 급등하면 보유 채권 평가손이 발생합니다.",
        "keyLesson": "금리 상승기에는 보험주가 고전합니다!",
        "survivalTip": "금리 하락기에는 투자 수익이 증가합니다.",
        "tags": ["삼성생명", "보험", "금리", "배당"],
        "events": [
            {"turn": 1, "title": "한은 기준금리 0.5%p 인상", "description": "한국은행이 기준금리를 0.5%p 인상. 보유 채권 평가손 우려에 -5.8% 하락!", "priceChange": "-5.8%", "sentiment": "shock"},
            {"turn": 2, "title": "채권 평가손 3조원 발생", "description": "삼성생명이 채권 평가손 3조원 발표. -4.2% 추가 하락.", "priceChange": "-4.2%", "sentiment": "negative"},
            {"turn": 3, "title": "배당 유지 발표", "description": "삼성생명이 배당을 전년 수준으로 유지 발표. +3.5% 반등.", "priceChange": "+3.5%", "sentiment": "positive"},
            {"turn": 4, "title": "금리 추가 인상", "description": "한은이 금리를 추가 0.25%p 인상. -3.2% 하락.", "priceChange": "-3.2%", "sentiment": "negative"},
            {"turn": 5, "title": "금리 인상 종료 시사", "description": "한은 총재가 \"금리 인상 사이클 종료\" 시사. +4.8% 반등!", "priceChange": "+4.8%", "sentiment": "positive"},
            {"turn": 6, "title": "투자 수익 개선", "description": "금리 안정화로 투자 수익 개선. +3.5% 상승.", "priceChange": "+3.5%", "sentiment": "positive"},
            {"turn": 7, "title": "금리 인하 기대감", "description": "시장이 내년 금리 인하를 기대. +4.2% 상승.", "priceChange": "+4.2%", "sentiment": "positive"},
            {"turn": 8, "title": "배당 확대 발표", "description": "삼성생명이 배당을 20% 확대 발표. +5.5% 급등.", "priceChange": "+5.5%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s20-1", "title": "금리 인상 저점 매수", "emoji": "🎯", "description": "평가손 발표 후 매수", "steps": ["1~2턴: 관망", "2턴: 평가손 발표에 100% 매수"], "risk": "보통", "expectedReturn": "+15% ~ +20%", "difficulty": 3},
            {"id": "s20-2", "title": "금리 안정화 후 매수", "emoji": "📊", "description": "인상 종료 시사 후 매수", "steps": ["1~4턴: 관망", "5턴: 인상 종료 후 100% 매수"], "risk": "낮음", "expectedReturn": "+12% ~ +15%", "difficulty": 2},
            {"id": "s20-3", "title": "금리 리스크 회피", "emoji": "🛡️", "description": "금리 하락 확정까지 관망", "steps": ["1~8턴: 전량 관망"], "risk": "매우 낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 금리 리스크 해소 때까지 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1~2턴: 관망", "2턴: 평가손 발표 폭락에 100% 매수", "3~8턴: 홀딩"], "result": "저점 매수 → +17.8%", "returnRate": "+17.8%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: 금리 안정화 후 100% 매수", "6~8턴: 홀딩"], "result": "안정화 후 진입 → +13.5%", "returnRate": "+13.5%"}
        ],
        "stats": {"avgClearRate": 72, "avgSurvivalRate": 82, "bestStrategy": "금리 인상 저점 매수"}
    },
    # ====== 배터리 분야 (신규) ======
    {
        "id": "legend-27", "order": 27,
        "title": "LG에너지솔루션, 배터리 전쟁",
        "subtitle": "전기차 배터리 1위의 위기와 기회",
        "emoji": "🔋", "category": "배터리",
        "difficulty": 3, "difficultyLabel": "중급",
        "gradientFrom": "from-lime-500", "gradientTo": "to-green-600",
        "stock": {"name": "LG에너지솔루션", "code": "373220", "sector": "배터리", "initialPrice": 420000},
        "description": "LG에너지솔루션은 전기차 배터리 글로벌 2위. 테슬라·GM과 공급 계약을 맺고 있지만, 중국 CATL의 추격이 거셉니다.",
        "keyLesson": "수주 잔고와 공급 계약이 배터리주의 핵심!",
        "survivalTip": "완성차 업체의 EV 판매량이 배터리 수요를 결정합니다.",
        "tags": ["LG에너지솔루션", "배터리", "전기차", "수주"],
        "events": [
            {"turn": 1, "title": "테슬라 배터리 내재화 선언", "description": "테슬라가 자체 배터리 생산 확대를 선언. LG에너지솔루션의 최대 고객 이탈 우려에 -7.5% 폭락!", "priceChange": "-7.5%", "sentiment": "shock"},
            {"turn": 2, "title": "GM 초대형 수주 계약", "description": "GM이 LG에너지솔루션과 10조원 규모 장기 공급 계약 체결! +8.2% 급등.", "priceChange": "+8.2%", "sentiment": "positive"},
            {"turn": 3, "title": "CATL 가격 경쟁 심화", "description": "중국 CATL이 배터리 가격을 20% 인하. 가격 경쟁 심화 우려에 -4.8% 하락.", "priceChange": "-4.8%", "sentiment": "negative"},
            {"turn": 4, "title": "리콜 이슈 발생", "description": "배터리 결함으로 대규모 리콜 발생. 비용 1조원 예상에 -9.2% 폭락!", "priceChange": "-9.2%", "sentiment": "shock"},
            {"turn": 5, "title": "IRA 보조금 확정", "description": "미국 IRA법에 따른 배터리 보조금이 확정. 북미 생산 공장 수혜. +11.5% 급등!", "priceChange": "+11.5%", "sentiment": "positive"},
            {"turn": 6, "title": "전고체 배터리 개발 성공", "description": "LG에너지솔루션이 차세대 전고체 배터리 샘플 개발에 성공! +8.8% 급등.", "priceChange": "+8.8%", "sentiment": "positive"},
            {"turn": 7, "title": "애리조나 공장 양산 시작", "description": "미국 애리조나 공장이 양산을 시작. +5.5% 상승.", "priceChange": "+5.5%", "sentiment": "positive"},
            {"turn": 8, "title": "수주 잔고 300조원 돌파", "description": "LG에너지솔루션의 수주 잔고가 300조원 돌파. +7.2% 급등. 배터리 전쟁 승리!", "priceChange": "+7.2%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s27-1", "title": "리콜 저점 매수", "emoji": "🎯", "description": "리콜 폭락 시 매수", "steps": ["1~3턴: 관망", "4턴: 리콜 폭락에 100% 매수", "5~8턴: 홀딩"], "risk": "높음", "expectedReturn": "+35% ~ +45%", "difficulty": 4},
            {"id": "s27-2", "title": "IRA 수혜 확인 후 매수", "emoji": "📊", "description": "보조금 확정 후 매수", "steps": ["1~4턴: 관망", "5턴: IRA 보조금 확정 후 100% 매수"], "risk": "보통", "expectedReturn": "+25% ~ +30%", "difficulty": 3},
            {"id": "s27-3", "title": "배터리 리스크 회피", "emoji": "🛡️", "description": "경쟁 심화로 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 배터리 경쟁 심화로 관망", "리콜 리스크도 부담"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1~3턴: 관망", "4턴: 리콜 폭락에 100% 매수", "5턴: IRA 수혜에 환호", "8턴: 수주 잔고에 만족"], "result": "리콜 저점 매수 → +38.5%", "returnRate": "+38.5%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~4턴: 관망", "5턴: IRA 보조금 확정 후 100% 매수", "6~8턴: 홀딩"], "result": "IRA 확인 후 진입 → +26.2%", "returnRate": "+26.2%"}
        ],
        "stats": {"avgClearRate": 62, "avgSurvivalRate": 72, "bestStrategy": "리콜 저점 매수"}
    },
    {
        "id": "legend-28", "order": 28,
        "title": "삼성SDI, 전고체 배터리의 꿈",
        "subtitle": "차세대 배터리 기술 경쟁",
        "emoji": "⚡", "category": "배터리",
        "difficulty": 3, "difficultyLabel": "중급",
        "gradientFrom": "from-lime-600", "gradientTo": "to-emerald-600",
        "stock": {"name": "삼성SDI", "code": "006400", "sector": "배터리", "initialPrice": 510000},
        "description": "삼성SDI는 BMW·아우디 등 프리미엄 완성차에 배터리를 공급합니다. 전고체 배터리 기술이 미래를 결정합니다.",
        "keyLesson": "기술력이 가격 경쟁력보다 중요한 프리미엄 시장!",
        "survivalTip": "전고체 배터리 개발 진척도가 주가를 움직입니다.",
        "tags": ["삼성SDI", "배터리", "전고체", "프리미엄"],
        "events": [
            {"turn": 1, "title": "BMW 수주 감소 뉴스", "description": "BMW가 EV 판매 부진으로 배터리 주문량을 20% 감축. -6.8% 하락!", "priceChange": "-6.8%", "sentiment": "negative"},
            {"turn": 2, "title": "중국 배터리 관세 부과", "description": "EU가 중국산 배터리에 관세 부과 발표. 삼성SDI의 유럽 점유율 확대 기대에 +5.5% 상승.", "priceChange": "+5.5%", "sentiment": "positive"},
            {"turn": 3, "title": "전고체 배터리 시제품 공개", "description": "삼성SDI가 전고체 배터리 시제품을 공개! 2027년 양산 목표. +12.5% 급등!", "priceChange": "+12.5%", "sentiment": "positive"},
            {"turn": 4, "title": "원재료 가격 급등", "description": "리튬·니켈 가격이 급등. 원가 부담 증가에 -5.2% 하락.", "priceChange": "-5.2%", "sentiment": "negative"},
            {"turn": 5, "title": "아우디 전기차 출시 호조", "description": "아우디 전기 SUV가 대박. 삼성SDI 배터리 수주 급증에 +7.8% 상승.", "priceChange": "+7.8%", "sentiment": "positive"},
            {"turn": 6, "title": "헝가리 공장 가동 시작", "description": "삼성SDI 헝가리 2공장이 양산 시작. 유럽 생산능력 2배 확대. +6.2% 상승.", "priceChange": "+6.2%", "sentiment": "positive"},
            {"turn": 7, "title": "전고체 배터리 투자 확대", "description": "삼성SDI가 전고체 배터리에 3조원 추가 투자 발표. +8.5% 급등.", "priceChange": "+8.5%", "sentiment": "positive"},
            {"turn": 8, "title": "리비안 신규 수주", "description": "미국 리비안과 신규 배터리 공급 계약 체결! +9.5% 급등.", "priceChange": "+9.5%", "sentiment": "positive"}
        ],
        "strategies": [
            {"id": "s28-1", "title": "전고체 기술 매수", "emoji": "🎯", "description": "전고체 시제품 공개 시 매수", "steps": ["1~2턴: 관망", "3턴: 전고체 시제품에 100% 매수"], "risk": "보통", "expectedReturn": "+30% ~ +40%", "difficulty": 3},
            {"id": "s28-2", "title": "원가 부담 저점 매수", "emoji": "📊", "description": "원재료 급등 폭락 시 매수", "steps": ["1~3턴: 관망", "4턴: 원가 부담 하락에 100% 매수"], "risk": "높음", "expectedReturn": "+35% ~ +45%", "difficulty": 4},
            {"id": "s28-3", "title": "배터리 리스크 회피", "emoji": "🛡️", "description": "경쟁 심화로 관망", "steps": ["1~8턴: 전량 관망"], "risk": "낮음", "expectedReturn": "0%", "difficulty": 1}
        ],
        "aiStrategies": [
            {"name": "안정왕 김철수", "type": "안정형", "emoji": "🛡️", "color": "green", "actions": ["1~8턴: 배터리 경쟁 불확실성으로 관망"], "result": "리스크 회피 → 0%", "returnRate": "0%"},
            {"name": "공격왕 박영희", "type": "공격형", "emoji": "⚡", "color": "red", "actions": ["1~2턴: 관망", "3턴: 전고체 시제품에 100% 매수", "4턴: 원가 부담에 흔들리지만 홀딩", "8턴: 신규 수주에 환호"], "result": "기술 기대감 매수 → +35.8%", "returnRate": "+35.8%"},
            {"name": "균형왕 이준호", "type": "균형형", "emoji": "⚖️", "color": "blue", "actions": ["1~3턴: 관망", "4턴: 원가 부담 하락에 100% 매수", "5~8턴: 홀딩"], "result": "저점 포착 → +32.5%", "returnRate": "+32.5%"}
        ],
        "stats": {"avgClearRate": 64, "avgSurvivalRate": 74, "bestStrategy": "전고체 기술 매수"}
    }
]

# ==============================================================
# 1단계: 기존 시나리오에 aiStrategies 필드 추가/복원
# ==============================================================
print("1️⃣ aiStrategies 필드 수정 중...")
for scenario in data['scenarios']:
    sid = scenario['id']
    
    # aiStrategies가 없으면 추가
    if 'aiStrategies' not in scenario or scenario['aiStrategies'] is None:
        if sid in AI_STRATEGIES_DATA:
            scenario['aiStrategies'] = AI_STRATEGIES_DATA[sid]
            print(f"  ✅ {sid}: aiStrategies 추가")
        else:
            print(f"  ⚠️ {sid}: aiStrategies 데이터 없음 - 기존 aiResponses로 변환")
            # aiResponses에서 변환 시도
            if 'aiResponses' in scenario:
                strategies = []
                for resp in scenario.get('aiResponses', []):
                    template = AI_TEMPLATES.get(resp.get('personality', 'balanced'), AI_TEMPLATES['balanced'])
                    strategies.append({
                        "name": template["name"],
                        "type": template["type"],
                        "emoji": template["emoji"],
                        "color": template["color"],
                        "actions": [resp.get("reasoning", "전략적 판단으로 대응")],
                        "result": f"최종 수익률 → {resp.get('finalReturn', '0%')}",
                        "returnRate": resp.get("finalReturn", "0%")
                    })
                scenario['aiStrategies'] = strategies
                print(f"  ✅ {sid}: aiResponses → aiStrategies 변환")
    
    # aiResponses 필드 제거 (통일)
    if 'aiResponses' in scenario:
        del scenario['aiResponses']

# ==============================================================
# 2단계: 신규 시나리오 추가 (중복 체크)
# ==============================================================
print("\n2️⃣ 신규 시나리오 추가 중...")
existing_ids = {s['id'] for s in data['scenarios']}
added = 0
for new_s in NEW_SCENARIOS:
    if new_s['id'] not in existing_ids:
        # aiResponses가 있으면 제거
        if 'aiResponses' in new_s:
            del new_s['aiResponses']
        data['scenarios'].append(new_s)
        existing_ids.add(new_s['id'])
        added += 1
        print(f"  ✅ {new_s['id']}: {new_s['title']}")
    else:
        # 이미 있으면 업데이트
        for i, s in enumerate(data['scenarios']):
            if s['id'] == new_s['id']:
                if 'aiResponses' in new_s:
                    del new_s['aiResponses']
                data['scenarios'][i] = new_s
                print(f"  🔄 {new_s['id']}: 업데이트")
                break

print(f"  → {added}개 추가")

# ==============================================================
# 3단계: order 순서대로 정렬
# ==============================================================
data['scenarios'].sort(key=lambda x: x.get('order', 999))

# ==============================================================
# 4단계: 전체 검증
# ==============================================================
print("\n3️⃣ 전체 검증 중...")
errors = []
for s in data['scenarios']:
    sid = s['id']
    # 필수 필드 확인
    required = ['id','order','title','subtitle','emoji','category','difficulty',
                'difficultyLabel','gradientFrom','gradientTo','stock','description',
                'keyLesson','survivalTip','tags','events','strategies','aiStrategies','stats']
    for field in required:
        if field not in s:
            errors.append(f"{sid}: 누락 필드 '{field}'")
    
    # events 8개 확인
    if len(s.get('events', [])) != 8:
        errors.append(f"{sid}: events {len(s.get('events', []))}개 (8개 필요)")
    
    # aiStrategies 3개 확인
    if len(s.get('aiStrategies', [])) != 3:
        errors.append(f"{sid}: aiStrategies {len(s.get('aiStrategies', []))}개 (3개 필요)")
    
    # aiStrategies 필드 확인
    for ai in s.get('aiStrategies', []):
        for field in ['name', 'type', 'emoji', 'color', 'actions', 'result', 'returnRate']:
            if field not in ai:
                errors.append(f"{sid}: aiStrategies 내 '{field}' 누락")
    
    # stats 필드 확인
    for field in ['avgClearRate', 'avgSurvivalRate', 'bestStrategy']:
        if field not in s.get('stats', {}):
            errors.append(f"{sid}: stats 내 '{field}' 누락")

if errors:
    print(f"  ❌ {len(errors)}개 에러 발견:")
    for e in errors:
        print(f"    - {e}")
else:
    print(f"  ✅ 모든 {len(data['scenarios'])}개 시나리오 검증 통과!")

# ==============================================================
# 5단계: 저장
# ==============================================================
with open('legendary-scenarios.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n✅ 최종 결과: {len(data['scenarios'])}개 시나리오")
for s in data['scenarios']:
    has_ai = '✅' if 'aiStrategies' in s and len(s.get('aiStrategies',[])) == 3 else '❌'
    print(f"  {has_ai} {s['id']}: {s['title']} ({s['stock']['name']})")
