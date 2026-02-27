# Onboarding Page - 개선 사항

## 주요 개선 내용

### 1. AI Battle 슬라이드 - 3선 비교 차트 추가 ⭐

가장 중요한 개선 사항으로, 4번째 슬라이드(AI Battle)에 **3개의 선 그래프**를 추가하여 수익률 비교를 시각화했습니다.

#### 차트 구성
- **나 (초록색 선)**: 사용자의 수익률 추이
- **최고 수익 (노란색 선)**: 최고 성과자의 수익률 추이  
- **유사 AI (보라색 선)**: 비슷한 투자 성향 AI의 수익률 추이

#### 기술 스택
- **Recharts** 라이브러리 사용
- LineChart 컴포넌트로 3개 라인 동시 표시
- 그라데이션 효과 및 애니메이션 적용
- 반응형 디자인 (ResponsiveContainer)

#### 데이터 구조
```json
{
  "comparisonChart": {
    "data": [
      { "turn": 1, "user": 100, "topPerformer": 100, "similarAI": 100 },
      { "turn": 2, "user": 102, "topPerformer": 103, "similarAI": 101 },
      ...
    ],
    "finalReturns": {
      "user": "+8.2%",
      "topPerformer": "+22.0%",
      "similarAI": "+11.5%"
    },
    "insight": "3턴에서 매도 타이밍을 놓쳤어요..."
  }
}
```

### 2. 컴포넌트 분리 (유지보수성 향상)

기존의 단일 파일 구조를 **섹션별 함수 컴포넌트**로 분리했습니다.

#### 새로운 파일 구조
```
frontend/app/onboarding/
├── page.tsx                              # 메인 페이지
├── config.ts                             # 설정 및 라벨 관리
├── data.json                             # 컨텐츠 데이터 (JSON)
└── components/
    ├── ChartTrainingPreview.tsx          # 1번 슬라이드
    ├── EventScenarioPreview.tsx          # 2번 슬라이드
    ├── RealDataPreview.tsx               # 3번 슬라이드
    └── AIBattlePreview.tsx               # 4번 슬라이드 (NEW!)
```

### 3. 데이터 관리 개선

#### data.json
- 슬라이드 컨텐츠를 JSON으로 관리
- 차트 비교 데이터 포함
- 텍스트 수정이 용이

#### config.ts
- 색상 매핑
- 라벨 관리
- 설정값 중앙화
- JSON 데이터를 TypeScript 타입으로 변환

### 4. 코드 품질 개선

✅ **함수 컴포넌트 사용**: 각 슬라이드를 독립적인 컴포넌트로 분리  
✅ **파일 분할**: 유지보수가 쉬운 구조  
✅ **JSON 데이터 관리**: 컨텐츠와 로직 분리  
✅ **config.ts 활용**: 설정값 중앙 관리  
✅ **타입 안정성**: TypeScript 타입 추론 활용

## 사용 방법

### 개발 서버 실행
```bash
cd frontend
npm run dev
```

### 페이지 접속
```
http://localhost:3000/onboarding
```

### 데이터 수정
1. **컨텐츠 수정**: `data.json` 파일 편집
2. **라벨 수정**: `config.ts`의 `LABELS` 객체 편집
3. **차트 데이터 수정**: `data.json`의 `comparisonChart.data` 배열 편집

## 주요 특징

### AI Battle 차트의 교육적 가치
1. **시각적 비교**: 3개 라인을 동시에 보여줘 성과 차이를 직관적으로 파악
2. **파도 읽기 학습**: 수익률 곡선의 흐름을 통해 매매 타이밍 학습
3. **AI 피드백**: 차트 하단에 구체적인 개선 포인트 제시
4. **동기부여**: 최고 수익자와의 차이를 보며 학습 의욕 고취

### 반응형 디자인
- 모바일 최적화
- 터치 스와이프 지원
- 부드러운 애니메이션

### 성능 최적화
- Canvas 기반 차트 애니메이션 (슬라이드 1-3)
- Recharts 라이브러리 (슬라이드 4)
- 컴포넌트 lazy loading 가능

## 빌드 확인

```bash
cd frontend
npm run build
```

✅ 빌드 성공 확인 완료
