import { useMemo, useState } from "react";
import "./App.css";
import { CARS } from "./data/cars";

const normalize = (v) => (v ?? "").toString().trim(); // 공백/undefined 방지
const uniq = (arr) => [...new Set(arr.map(normalize).filter(Boolean))].sort();

function ToggleGroup({ title, options, selected, onToggle }) {
  return (
    <div className="filterBox">
      <div className="filterTitle">{title}</div>
      <div className="chips">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              className={`chip ${active ? "active" : ""}`}
              onClick={() => onToggle(opt)}
              type="button"
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ✅ Set 필터 체크(선택값 없으면 통과, 있으면 "정확히 일치"만 통과)
const matchesSet = (selectedSet, value) => {
  if (selectedSet.size === 0) return true;
  return selectedSet.has(normalize(value));
};

// ✅ React key 꼬임 방지용: "전역 유일" 복합키
const rowKey = (c) => {
  return [
    normalize(c.id),
    normalize(c.제조사),
    normalize(c.차종),
    normalize(c.모델명),
    normalize(c.바디타입),
    normalize(c.출시년도),
    normalize(c.실린더개수),
    normalize(c.구동방식),
    normalize(c.엔진코드),
    normalize(c.미션),
    normalize(c.연료),
    normalize(c.공인연비),
    normalize(c.최대인원 ?? c.인원),
    normalize(c.적합환경 ?? c.주행환경 ?? c.주용도),
  ].join("|");
};

export default function App() {
  // ✅ 스키마 혼재 대비(예전 키들이 있어도 표시되게)
  const getMaxPeople = (c) => normalize(c.최대인원 ?? c.인원 ?? "");
  const getEnvironment = (c) =>
    normalize(c.적합환경 ?? c.주행환경 ?? c.주용도 ?? "");

  const FILTERS = useMemo(() => {
    return {
      제조사: uniq(CARS.map((c) => c.제조사)),
      차종: uniq(CARS.map((c) => c.차종)),
      바디타입: uniq(CARS.map((c) => c.바디타입)),
      연료: uniq(CARS.map((c) => c.연료)),
      구동방식: uniq(CARS.map((c) => c.구동방식)),
      최대인원: uniq(CARS.map((c) => getMaxPeople(c))),
      적합환경: uniq(CARS.map((c) => getEnvironment(c))),
    };
  }, []);

  const [maker, setMaker] = useState(new Set());
  const [segment, setSegment] = useState(new Set());
  const [body, setBody] = useState(new Set());
  const [fuel, setFuel] = useState(new Set());
  const [drive, setDrive] = useState(new Set());
  const [maxPeople, setMaxPeople] = useState(new Set());
  const [env, setEnv] = useState(new Set());
  const [q, setQ] = useState("");

  const toggle = (setter, setObj, value) => {
    const v = normalize(value);
    const next = new Set(setObj);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const resetAll = () => {
    setMaker(new Set());
    setSegment(new Set());
    setBody(new Set());
    setFuel(new Set());
    setDrive(new Set());
    setMaxPeople(new Set());
    setEnv(new Set());
    setQ("");
  };

  const filtered = useMemo(() => {
    
    const keyword = normalize(q).toLowerCase();
// ✅ 어떤 필터든(또는 검색어) 하나라도 있어야 결과 표시
const hasAnyFilter =
  maker.size > 0 ||
  segment.size > 0 ||
  body.size > 0 ||
  fuel.size > 0 ||
  drive.size > 0 ||
  maxPeople.size > 0 ||
  env.size > 0 ||
  normalize(q).length > 0;

if (!hasAnyFilter) return [];
    return CARS.filter((car) => {
      const makerV = normalize(car.제조사);
      const segV = normalize(car.차종);
      const bodyV = normalize(car.바디타입);
      const fuelV = normalize(car.연료);
      const driveV = normalize(car.구동방식);

      const mp = getMaxPeople(car);
      const ev = getEnvironment(car);

      const okMaker = matchesSet(maker, makerV);
      const okSeg = matchesSet(segment, segV);
      const okBody = matchesSet(body, bodyV);
      const okFuel = matchesSet(fuel, fuelV);
      const okDrive = matchesSet(drive, driveV);
      const okMaxPeople = matchesSet(maxPeople, mp);
      const okEnv = matchesSet(env, ev);

      const hay = `${normalize(car.모델명)} ${normalize(car.엔진코드)}`.toLowerCase();
      const okQ = keyword.length === 0 || hay.includes(keyword);

      return (
        okMaker &&
        okSeg &&
        okBody &&
        okFuel &&
        okDrive &&
        okMaxPeople &&
        okEnv &&
        okQ
      );
    });
  }, [maker, segment, body, fuel, drive, maxPeople, env, q]);

  return (
    <div className="page">
      <header className="header">
        <h1>중고차 스펙 필터</h1>
        <button className="reset" onClick={resetAll} type="button">
          전체 초기화
        </button>
      </header>

      <div className="searchRow">
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="모델명/엔진코드 검색 (예: 그랜저, G4KN, D4HB)"
        />
        <div className="count">검색 결과: {filtered.length}개</div>
      </div>

      <div className="layout">
        <div className="mainCol">
          <section className="filters">
            <ToggleGroup
              title="제조사"
              options={FILTERS.제조사}
              selected={maker}
              onToggle={(v) => toggle(setMaker, maker, v)}
            />
            <ToggleGroup
              title="차종"
              options={FILTERS.차종}
              selected={segment}
              onToggle={(v) => toggle(setSegment, segment, v)}
            />
            <ToggleGroup
              title="바디타입"
              options={FILTERS.바디타입}
              selected={body}
              onToggle={(v) => toggle(setBody, body, v)}
            />
            <ToggleGroup
              title="연료"
              options={FILTERS.연료}
              selected={fuel}
              onToggle={(v) => toggle(setFuel, fuel, v)}
            />
            <ToggleGroup
              title="구동방식"
              options={FILTERS.구동방식}
              selected={drive}
              onToggle={(v) => toggle(setDrive, drive, v)}
            />
            {FILTERS.최대인원.length > 0 && (
              <ToggleGroup
                title="최대인원"
                options={FILTERS.최대인원}
                selected={maxPeople}
                onToggle={(v) => toggle(setMaxPeople, maxPeople, v)}
              />
            )}
            {FILTERS.적합환경.length > 0 && (
              <ToggleGroup
                title="적합환경"
                options={FILTERS.적합환경}
                selected={env}
                onToggle={(v) => toggle(setEnv, env, v)}
              />
            )}
          </section>

          <section className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>제조사</th>
                  <th>차종</th>
                  <th>모델명</th>
                  <th>바디타입</th>
                  <th>출시년도</th>
                  <th>실린더개수</th>
                  <th>구동방식</th>
                  <th>엔진(코드)</th>
                  <th>미션</th>
                  <th>연료</th>
                  <th>공인연비(복합)</th>
                  <th>최대인원</th>
                  <th>적합환경</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={rowKey(c)}>
                    <td>{normalize(c.제조사)}</td>
                    <td>{normalize(c.차종)}</td>
                    <td className="strong">{normalize(c.모델명)}</td>
                    <td>{normalize(c.바디타입)}</td>
                    <td>{normalize(c.출시년도)}</td>
                    <td>{normalize(c.실린더개수)}</td>
                    <td>{normalize(c.구동방식)}</td>
                    <td className="wrap">{normalize(c.엔진코드)}</td>
                    <td>{normalize(c.미션)}</td>
                    <td>{normalize(c.연료)}</td>
                    <td>{normalize(c.공인연비)}</td>
                    <td>{getMaxPeople(c)}</td>
                    <td className="wrap">{getEnvironment(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* ✅ 오른쪽 정보 패널 */}
        <aside className="sideCol">
          <div className="sideCard">
            <div className="sideTitle">연료별 특성</div>

            <div className="sideSection">
              <div className="sideH">가솔린</div>
              <ul className="sideList">
                <li>적용 환경: 제한 없음</li>
                <li>특징: 정숙성 양호, 운용 난이도 보통</li>
                <li>참고: GDI(직분사) 적용 차량은 오일 소모(감소) 여부 점검</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">디젤</div>
              <ul className="sideList">
                <li>적용 환경: 고속·장거리 주행 비중이 높은 경우</li>
                <li>특징: DPF 특성상 주기적 고속 주행 재생 요구</li>
                <li>참고: DPF/EGR/인젝터/터보 관련 이력 및 경고등 확인</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">LPG</div>
              <ul className="sideList">
                <li>적용 환경: 연료비 절감 목적의 주행거리 많은 운행</li>
                <li>특징: 연료 단가가 낮고, 연비는 낮은 편</li>
                <li>정숙/정비: 디젤·가솔린 대비 정비비 체감이 낮은 편으로 평가되는 경우</li>
                <li>충전: 생활권 내 충전소 접근성 필요</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">하이브리드</div>
              <ul className="sideList">
                <li>적용 환경: 도심 정체 비중이 높고 주행거리 많은 경우</li>
                <li>경제성: 연 3만 km 이상에서 연료비 체감이 유리한 편</li>
                <li>참고: 배터리 상태 및 보증/정비 이력 확인</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">전기</div>
              <ul className="sideList">
                <li>적용 환경: 상시 충전 환경(주거지·직장 등) 확보가 전제</li>
                <li>경제성: 연 3만 km 이상에서 연료비 체감이 유리한 편</li>
                <li>
                  참고: 배터리 SOH·셀 전압차, 급속 충전 비율/이력, 감속기 소음 확인
                </li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">수소(연료전지)</div>
              <ul className="sideList">
                <li>적용 환경: 생활권 내 충전 인프라 확보가 핵심</li>
                <li>참고: 시스템 점검/보증/리콜 이력 확인</li>
              </ul>
            </div>
          </div>

          <div className="sideCard">
            <div className="sideTitle">구동방식/변속기</div>

            <div className="sideSection">
              <div className="sideH">AWD(4륜)</div>
              <ul className="sideList">
                <li>장점: 코너링/고속/악조건 노면에서 안정성 향상</li>
                <li>유의: 타이어 4본 동일 관리, 구동계 오일 관리, 유지비 증가 가능</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">토크컨버터 AT</div>
              <ul className="sideList">
                <li>특징: 범용성 높고 운용 난이도 낮은 편</li>
                <li>참고: 변속 충격 및 오일 이력 확인</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">DCT</div>
              <ul className="sideList">
                <li>특징: 효율 높고 연비 유리한 편</li>
                <li>유의: 정체·언덕 반복에서 저속 울컥/떨림 체감 가능</li>
              </ul>
            </div>

            <div className="sideSection">
              <div className="sideH">CVT/IVT</div>
              <ul className="sideList">
                <li>특징: 변속 감각 부드러운 편</li>
                <li>유의: 오일 관리 중요, 가속 시 소음/미끄러짐 체감 확인</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}