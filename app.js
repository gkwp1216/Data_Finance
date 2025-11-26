// 전역 변수
const API_URL = 'https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json';
let apiKey = 'a840a5ad65e360f78621fc44725022e66f951d3659cea20e297a7a1b21e2929a';
let chartInstance = null;
let currentFinancialData = null; // 현재 표시된 재무 데이터 저장

// DOM 요소
const elements = {
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    apiKeyStatus: document.getElementById('apiKeyStatus'),
    corpName: document.getElementById('corpName'),
    bizrNo: document.getElementById('bizrNo'),
    bsnsYear: document.getElementById('bsnsYear'),
    reprtCode: document.getElementById('reprtCode'),
    searchBtn: document.getElementById('searchBtn'),
    corpName2: document.getElementById('corpName2'),
    bizrNo2: document.getElementById('bizrNo2'),
    bsnsYear2: document.getElementById('bsnsYear2'),
    reprtCode2: document.getElementById('reprtCode2'),
    searchBtn2: document.getElementById('searchBtn2'),
    backBtn: document.getElementById('backBtn'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultSection: document.getElementById('resultSection'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    financialTableBody: document.getElementById('financialTableBody'),
    companyOverview: document.getElementById('companyOverview'),
    debtRatio: document.getElementById('debtRatio'),
    equityRatio: document.getElementById('equityRatio'),
    currentRatio: document.getElementById('currentRatio'),
    roe: document.getElementById('roe')
};

// 초기화
function init() {
    // API 키가 이미 설정되어 있음
    if (elements.apiKeyInput) {
        elements.apiKeyInput.value = apiKey.substring(0, 20) + '...';
        elements.apiKeyInput.disabled = true;
        if (elements.apiKeyStatus) {
            showApiKeyStatus(true);
        }
    }

    // 이벤트 리스너 등록
    if (elements.saveApiKeyBtn) {
        elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    }
    elements.searchBtn.addEventListener('click', searchFinancialData);
    
    // 결과 페이지의 검색 버튼
    if (elements.searchBtn2) {
        elements.searchBtn2.addEventListener('click', searchFinancialDataFromResult);
    }
    
    // 메인으로 돌아가기 버튼
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', backToMain);
    }
    
    // Enter 키 이벤트
    elements.corpName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchFinancialData();
    });
    
    if (elements.corpName2) {
        elements.corpName2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchFinancialDataFromResult();
        });
    }

    // 대표 기업 목록 자동 로드
    loadFeaturedCompanies();
}

// API 키 저장
function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (!key) {
        showError('API 키를 입력해주세요.');
        return;
    }
    
    apiKey = key;
    localStorage.setItem('fssApiKey', key);
    showApiKeyStatus(true);
}

// API 키 상태 표시
function showApiKeyStatus(isSuccess) {
    elements.apiKeyStatus.textContent = isSuccess ? '✓ 저장됨' : '✗ 저장 실패';
    elements.apiKeyStatus.className = `status-indicator ${isSuccess ? 'success' : 'error'}`;
}

// 로딩 표시
function showLoading(show) {
    elements.loadingIndicator.classList.toggle('hidden', !show);
    elements.searchBtn.disabled = show;
}

// 에러 표시
function showError(message) {
    // 기존 오류 요소가 있으면 사용
    if (elements.errorText && elements.errorMessage) {
        elements.errorText.textContent = message;
        elements.errorMessage.classList.remove('hidden');
        setTimeout(() => {
            elements.errorMessage.classList.add('hidden');
        }, 5000);
    }
    
    // 배경 오버레이 추가
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    
    // 모달 팝업으로도 표시 (더 명확한 알림)
    const errorModal = document.createElement('div');
    errorModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        min-width: 300px;
    `;
    errorModal.innerHTML = `
        <p style="color: #e74c3c; font-size: 18px; margin-bottom: 1rem; font-weight: bold;">⚠️ 오류</p>
        <p style="color: #333; font-size: 14px; margin-bottom: 1.5rem; line-height: 1.5; white-space: pre-line;">${message}</p>
        <button id="errorModalBtn" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 0.7rem 2rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        ">확인</button>
    `;
    
    // 오버레이와 모달을 함께 제거하는 함수
    const closeModal = () => {
        overlay.remove();
        errorModal.remove();
    };
    
    // 오버레이 클릭 시 닫기
    overlay.onclick = closeModal;
    
    document.body.appendChild(overlay);
    document.body.appendChild(errorModal);
    
    // 확인 버튼에 이벤트 리스너 추가
    document.getElementById('errorModalBtn').addEventListener('click', closeModal);
}

// 한국 주요 상장기업 목록 (코스피, 코스닥)
const LISTED_COMPANIES = [
    '삼성전자', 'SK하이닉스', 'LG에너지솔루션', '삼성바이오로직스', '현대차',
    '기아', 'POSCO홀딩스', '삼성물산', 'NAVER', '카카오',
    'LG화학', '현대모비스', '삼성SDI', '기업은행', 'KB금융',
    '신한지주', '하나금융지주', 'LG전자', '포스코퓨처엠', '셀트리온',
    'SK이노베이션', 'SK텔레콤', 'KT&G', '삼성생명', '한국전력',
    'LG', '두산에너빌리티', '고려아연', 'HMM', '대한항공',
    'SK', 'HD현대중공업', '삼성화재', 'HD한국조선해양', '메리츠금융지주',
    '크래프톤', '엔씨소프트', '넷마블', '펄어비스', '컴투스',
    '삼성전기', 'LG디스플레이', '에코프로비엠', '에코프로', 'SK스퀘어',
    'CJ제일제당', '한화에어로스페이스', '한온시스템', 'HD현대일렉트릭', '롯데케미칼',
    '하이브', 'JYP Ent.', 'SM', 'YG', '빅히트',
    '카카오뱅크', '카카오페이', '토스', '쿠팡', '배달의민족',
];

// 재무정보 검색
// 기업명 유효성 검증
function isValidCompanyName(name) {
    if (!name || name.length < 2) return false;
    
    // 한글, 영문, 숫자만 허용 (특수문자 제외)
    const validPattern = /^[가-힣a-zA-Z0-9\s]+$/;
    if (!validPattern.test(name)) return false;
    
    // 숫자로만 이루어진 경우 제외
    if (/^[0-9]+$/.test(name)) return false;
    
    return true;
}

// 상장 기업 여부 확인
function isListedCompany(name) {
    const normalizedName = name.trim();
    // 정확한 매칭 또는 부분 매칭
    return LISTED_COMPANIES.some(company => 
        company === normalizedName || 
        company.includes(normalizedName) ||
        normalizedName.includes(company)
    );
}

async function searchFinancialData() {
    // 입력값 검증
    if (!apiKey) {
        showError('먼저 API 키를 저장해주세요.');
        return;
    }

    const corpName = elements.corpName.value.trim();
    if (!corpName) {
        showError('기업명을 입력해주세요.');
        return;
    }
    
    if (!isValidCompanyName(corpName)) {
        showError('올바른 기업명을 입력해주세요. (한글, 영문, 숫자만 가능)');
        return;
    }
    
    // 상장 기업 여부 확인
    if (!isListedCompany(corpName)) {
        showError('상장되지 않은 기업명입니다.\n코스피 또는 코스닥에 상장된 기업명을 입력해주세요.');
        return;
    }

    const bsnsYear = elements.bsnsYear.value;
    const reprtCode = elements.reprtCode.value;
    const bizrNo = elements.bizrNo.value.trim();

    // 초기 레이아웃 숨기고 결과 레이아웃으로 전환
    document.getElementById('initialLayout').classList.add('hidden');
    document.getElementById('resultLayout').classList.remove('hidden');
    
    // 결과 페이지 검색 폼에도 값 동기화
    syncSearchForms(corpName, bizrNo, bsnsYear, reprtCode);
    
    showLoading(true);
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');

    try {
        // API 호출 (CORS 문제로 인해 프록시 서버 또는 백엔드 필요)
        // 여기서는 데모 데이터를 사용
        const data = await fetchFinancialData(corpName, bsnsYear, reprtCode);
        
        if (data && data.success) {
            displayFinancialData(data);
        } else {
            throw new Error(data.message || '데이터를 가져오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || '데이터 조회 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// API 호출 함수 (실제 구현)
async function fetchFinancialData(corpName, bsnsYear, reprtCode) {
    // 실제 API 엔드포인트
    // 주의: CORS 정책으로 인해 브라우저에서 직접 호출이 안될 수 있습니다.
    // 프로덕션에서는 백엔드 프록시 서버를 통해 호출해야 합니다.
    
    const baseUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
    const params = new URLSearchParams({
        crtfc_key: apiKey,
        corp_code: '00126380', // 실제로는 기업명으로 검색 후 corp_code를 가져와야 함
        bsns_year: bsnsYear,
        reprt_code: reprtCode
    });

    try {
        // const response = await fetch(`${baseUrl}?${params}`);
        // const data = await response.json();
        
        // 데모: CORS 문제로 인해 샘플 데이터 반환
        console.log('API 호출 시도:', corpName, bsnsYear, reprtCode);
        
        // 샘플 데이터 반환 (실제 API 응답 형식과 유사)
        return generateSampleData(corpName, bsnsYear);
        
    } catch (error) {
        console.error('API 호출 실패:', error);
        // 데모용 샘플 데이터 반환
        return generateSampleData(corpName, bsnsYear);
    }
}

// 샘플 데이터 생성 (데모용)
function generateSampleData(corpName, year) {
    // 기업명 기반 시드값 생성 (같은 기업은 같은 데이터)
    let seed = 0;
    for (let i = 0; i < corpName.length; i++) {
        seed += corpName.charCodeAt(i);
    }
    
    // 시드 기반 랜덤 함수
    const seededRandom = (min, max) => {
        seed = (seed * 9301 + 49297) % 233280;
        return min + (seed / 233280) * (max - min);
    };
    
    // 기업별 특성 설정
    const baseAmount = Math.floor(seededRandom(80000000000, 400000000000));
    const debtRatio = seededRandom(0.3, 0.7);  // 부채비율 30-70%
    const currentRatioMultiplier = seededRandom(1.2, 2.8);  // 유동비율 120-280%
    const profitMargin = seededRandom(0.05, 0.2);  // 영업이익률 5-20%
    const netMargin = seededRandom(0.03, 0.15);  // 순이익률 3-15%
    
    const totalAssets = baseAmount;
    const totalLiabilities = Math.floor(totalAssets * debtRatio);
    const totalEquity = totalAssets - totalLiabilities;
    const currentAssets = Math.floor(totalAssets * seededRandom(0.45, 0.65));
    const currentLiabilities = Math.floor(currentAssets / currentRatioMultiplier);
    const nonCurrentLiabilities = totalLiabilities - currentLiabilities;
    const revenue = Math.floor(totalAssets * seededRandom(0.7, 1.2));
    const operatingIncome = Math.floor(revenue * profitMargin);
    const netIncome = Math.floor(revenue * netMargin);
    
    return {
        success: true,
        corpName: corpName,
        year: year,
        items: [
            { account_nm: '자산총계', thstrm_amount: totalAssets },
            { account_nm: '유동자산', thstrm_amount: currentAssets },
            { account_nm: '비유동자산', thstrm_amount: totalAssets - currentAssets },
            { account_nm: '부채총계', thstrm_amount: totalLiabilities },
            { account_nm: '유동부채', thstrm_amount: currentLiabilities },
            { account_nm: '비유동부채', thstrm_amount: nonCurrentLiabilities },
            { account_nm: '자본총계', thstrm_amount: totalEquity },
            { account_nm: '매출액', thstrm_amount: revenue },
            { account_nm: '영업이익', thstrm_amount: operatingIncome },
            { account_nm: '당기순이익', thstrm_amount: netIncome }
        ]
    };
}

// 재무데이터 표시
function displayFinancialData(data) {
    // 초기 레이아웃 숨기고 결과 레이아웃 표시
    document.getElementById('initialLayout').classList.add('hidden');
    document.getElementById('resultLayout').classList.remove('hidden');

    // 기업 개요 표시
    elements.companyOverview.innerHTML = `
        <p><strong>기업명:</strong> ${data.corpName}</p>
        <p><strong>사업연도:</strong> ${data.year}</p>
        <p><strong>조회일시:</strong> ${new Date().toLocaleString('ko-KR')}</p>
    `;

    // 데이터 추출
    const financialData = {};
    data.items.forEach(item => {
        financialData[item.account_nm] = parseInt(item.thstrm_amount) || 0;
    });
    
    // 디버그: 재무 데이터 확인
    console.log('=== 재무 데이터 파싱 결과 ===');
    console.log('자산총계:', financialData['자산총계']?.toLocaleString());
    console.log('부채총계:', financialData['부채총계']?.toLocaleString());
    console.log('자본총계:', financialData['자본총계']?.toLocaleString());
    console.log('유동자산:', financialData['유동자산']?.toLocaleString());
    console.log('유동부채:', financialData['유동부채']?.toLocaleString());
    console.log('당기순이익:', financialData['당기순이익']?.toLocaleString());
    console.log('매출액:', financialData['매출액']?.toLocaleString());
    console.log('영업이익:', financialData['영업이익']?.toLocaleString());

    // 재무비율 계산 및 표시
    const ratios = calculateAndDisplayRatios(financialData);
    
    // 디버그: 계산된 비율 확인
    console.log('=== 계산된 재무 비율 ===');
    console.log('부채비율:', ratios.debtRatio.toFixed(2) + '%');
    console.log('자기자본비율:', ratios.equityRatio.toFixed(2) + '%');
    console.log('유동비율:', ratios.currentRatio.toFixed(2) + '%');
    console.log('ROE:', ratios.roe.toFixed(2) + '%');

    // 테이블 생성
    createFinancialTable(data.items);

    // 차트 생성
    createFinancialChart(financialData);

    // 결과 섹션 표시
    elements.resultSection.classList.remove('hidden');
    
    // 현재 재무 데이터 저장 (투자 지표 계산용)
    currentFinancialData = financialData;
    
    // 현재 기업 데이터 저장 (워치리스트용)
    currentCompanyData = {
        corpName: data.corpName,
        corpCode: data.corpCode || '',
        year: data.year,
        ...ratios,
        financialData: financialData
    };
    
    // 워치리스트 버튼 상태 업데이트
    updateWatchlistButton();
    
    // 워치리스트에 있는 기업이라면 재무 데이터 업데이트
    if (WatchlistManager.hasCompany(data.corpName)) {
        const item = WatchlistManager.watchlist.find(i => i.corpName === data.corpName);
        if (item) {
            const triggeredAlerts = WatchlistManager.updateFinancialData(item.id, ratios);
            
            // 트리거된 알림이 있으면 알림 표시
            if (triggeredAlerts.length > 0) {
                triggeredAlerts.forEach(alert => {
                    AlertManager.addToHistory(alert);
                    showAlertNotification(alert);
                });
            }
        }
    }
    
    // 뉴스 및 공시 로드
    if (currentCompanyData && currentCompanyData.corpName) {
        loadNews(currentCompanyData.corpName);
        // 공시는 기업 코드가 있을 때만 로드 (현재는 샘플 데이터 사용)
        loadDisclosure(currentCompanyData.corpCode || '00000000');
    }
    
    // 재무 건전성 점수 계산 및 표시
    calculateAndDisplayHealthScore();
    
    // 주식 데이터 자동 로드
    loadStockDataAutomatically();
    
    // 결과 섹션으로 스크롤
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 알림 알림창 표시
function showAlertNotification(alert) {
    const message = `[${alert.companyName}] ${alert.alert.metric}이(가) ${alert.alert.threshold}% ${alert.alert.condition === 'above' ? '이상' : '이하'}입니다. (현재: ${alert.currentValue.toFixed(2)}%)`;
    
    // 간단한 알림 표시 (실제 프로젝트에서는 토스트 알림 등 사용)
    const notification = document.createElement('div');
    notification.className = 'alert-notification';
    notification.textContent = '⚠️ ' + message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, var(--warning-color), #ff9800);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// 재무비율 계산 및 표시
function calculateAndDisplayRatios(data) {
    const assets = data['자산총계'] || 0;
    const liabilities = data['부채총계'] || 0;
    const equity = data['자본총계'] || 0;
    const currentAssets = data['유동자산'] || 0;
    const currentLiabilities = data['유동부채'] || 0;
    const netIncome = data['당기순이익'] || 0;

    console.log('=== 비율 계산용 원본 데이터 ===');
    console.log('부채총계:', liabilities, '/ 자본총계:', equity);
    console.log('유동자산:', currentAssets, '/ 유동부채:', currentLiabilities);
    console.log('당기순이익:', netIncome, '/ 자본총계:', equity);

    // 부채비율
    const debtRatioNum = equity > 0 ? (liabilities / equity) * 100 : 0;
    const debtRatio = debtRatioNum > 0 ? debtRatioNum.toFixed(2) : '-';
    elements.debtRatio.textContent = debtRatio !== '-' ? `${debtRatio}%` : '-';

    // 자기자본비율
    const equityRatioNum = assets > 0 ? (equity / assets) * 100 : 0;
    const equityRatio = equityRatioNum > 0 ? equityRatioNum.toFixed(2) : '-';
    elements.equityRatio.textContent = equityRatio !== '-' ? `${equityRatio}%` : '-';

    // 유동비율
    const currentRatioNum = currentLiabilities > 0 ? (currentAssets / currentLiabilities) * 100 : 0;
    const currentRatio = currentRatioNum > 0 ? currentRatioNum.toFixed(2) : '-';
    elements.currentRatio.textContent = currentRatio !== '-' ? `${currentRatio}%` : '-';

    // ROE
    const roeNum = equity > 0 ? (netIncome / equity) * 100 : 0;
    const roe = roeNum > 0 ? roeNum.toFixed(2) : '-';
    elements.roe.textContent = roe !== '-' ? `${roe}%` : '-';
    
    console.log('=== 계산된 정확한 비율 ===');
    console.log('부채비율:', debtRatioNum);
    console.log('자기자본비율:', equityRatioNum);
    console.log('유동비율:', currentRatioNum);
    console.log('ROE:', roeNum);
    
    // 비율 객체 반환 (워치리스트 업데이트용)
    return {
        debtRatio: debtRatioNum,
        equityRatio: equityRatioNum,
        currentRatio: currentRatioNum,
        roe: roeNum
    };
}

// 재무제표 테이블 생성
function createFinancialTable(items) {
    elements.financialTableBody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        const amount = parseInt(item.thstrm_amount) || 0;
        
        row.innerHTML = `
            <td>${item.account_nm}</td>
            <td>${formatCurrency(amount)}</td>
        `;
        
        elements.financialTableBody.appendChild(row);
    });
}

// 차트 생성
function createFinancialChart(data) {
    const ctx = document.getElementById('financialChart');
    
    // 기존 차트 제거
    if (chartInstance) {
        chartInstance.destroy();
    }

    const assets = data['자산총계'] || 0;
    const liabilities = data['부채총계'] || 0;
    const equity = data['자본총계'] || 0;

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['자산총계', '부채총계', '자본총계'],
            datasets: [{
                label: '금액 (백만원)',
                data: [
                    Math.round(assets / 1000000),
                    Math.round(liabilities / 1000000),
                    Math.round(equity / 1000000)
                ],
                backgroundColor: [
                    'rgba(26, 115, 232, 0.8)',
                    'rgba(234, 67, 53, 0.8)',
                    'rgba(52, 168, 83, 0.8)'
                ],
                borderColor: [
                    'rgba(26, 115, 232, 1)',
                    'rgba(234, 67, 53, 1)',
                    'rgba(52, 168, 83, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '재무 구조 (단위: 백만원)',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// 통화 포맷팅
function formatCurrency(amount) {
    return amount.toLocaleString('ko-KR') + ' 원';
}

// 대표 기업 목록 로드
function loadFeaturedCompanies() {
    const featuredCompanies = [
        { name: '삼성전자', code: '005930' },
        { name: 'SK하이닉스', code: '000660' },
        { name: 'LG에너지솔루션', code: '373220' },
        { name: '현대자동차', code: '005380' },
        { name: 'POSCO홀딩스', code: '005490' },
        { name: '네이버', code: '035420' },
        { name: '카카오', code: '035720' },
        { name: 'KB금융', code: '105560' }
    ];

    displayFeaturedCompanies(featuredCompanies);
}

// 대표 기업 표시
function displayFeaturedCompanies(companies) {
    const container = document.getElementById('featuredCompanies');
    if (!container) return;

    container.innerHTML = companies.map(company => `
        <div class="company-card" onclick="loadCompanyData('${company.name}', '${company.code}')">
            <h4>${company.name}</h4>
            <p class="company-code">${company.code}</p>
        </div>
    `).join('');
}

// 특정 기업 데이터 로드
async function loadCompanyData(corpName, corpCode) {
    // 기업명 유효성 검증 (레이아웃 전환 전에 체크)
    if (!corpName || !isValidCompanyName(corpName)) {
        showError('올바른 기업명을 입력해주세요.\n한글, 영문, 숫자만 가능합니다.');
        return;
    }
    
    // 상장 기업 여부 확인
    if (!isListedCompany(corpName)) {
        showError('상장되지 않은 기업명입니다.\n코스피 또는 코스닥에 상장된 기업명을 입력해주세요.');
        return;
    }
    
    elements.corpName.value = corpName;
    const bsnsYear = elements.bsnsYear.value;
    const reprtCode = elements.reprtCode.value;

    // 초기 레이아웃 숨기고 결과 레이아웃으로 전환
    document.getElementById('initialLayout').classList.add('hidden');
    document.getElementById('resultLayout').classList.remove('hidden');
    
    // 결과 페이지 검색 폼에도 값 동기화
    syncSearchForms(corpName, corpCode, bsnsYear, reprtCode);

    showLoading(true);
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');

    // CORS 문제로 인해 샘플 데이터 사용 (기업별로 다른 데이터 생성)
    setTimeout(() => {
        const data = generateSampleData(corpName, bsnsYear);
        displayFinancialData(data);
        showLoading(false);
    }, 500);
}

// 결과 페이지에서 검색
async function searchFinancialDataFromResult() {
    const corpName = elements.corpName2.value.trim();
    
    if (!corpName) {
        showError('기업명을 입력해주세요.');
        return;
    }
    
    if (!isValidCompanyName(corpName)) {
        showError('올바른 기업명을 입력해주세요. (한글, 영문, 숫자만 가능)');
        return;
    }
    
    // 상장 기업 여부 확인
    if (!isListedCompany(corpName)) {
        showError('상장되지 않은 기업명입니다.\n코스피 또는 코스닥에 상장된 기업명을 입력해주세요.');
        return;
    }

    const bsnsYear = elements.bsnsYear2.value;
    const reprtCode = elements.reprtCode2.value;
    
    // 메인 검색 폼에도 값 동기화
    elements.corpName.value = corpName;
    elements.bsnsYear.value = bsnsYear;
    elements.reprtCode.value = reprtCode;

    showLoading(true);
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');

    // CORS 문제로 인해 샘플 데이터 사용 (기업별로 다른 데이터 생성)
    setTimeout(() => {
        const data = generateSampleData(corpName, bsnsYear);
        displayFinancialData(data);
        showLoading(false);
    }, 500);
}

// 검색 폼 동기화
function syncSearchForms(corpName, bizrNo, bsnsYear, reprtCode) {
    if (elements.corpName2) {
        elements.corpName2.value = corpName;
        elements.bizrNo2.value = bizrNo;
        elements.bsnsYear2.value = bsnsYear;
        elements.reprtCode2.value = reprtCode;
    }
}

// 메인으로 돌아가기
function backToMain() {
    document.getElementById('resultLayout').classList.add('hidden');
    document.getElementById('initialLayout').classList.remove('hidden');
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
}

// =====================================================
// 워치리스트 UI 관리
// =====================================================

let currentCompanyData = null; // 현재 표시 중인 기업 데이터
let currentWatchlistItemId = null; // 현재 편집 중인 워치리스트 항목 ID

// 워치리스트 UI 초기화
function initWatchlistUI() {
    const watchlistBtn = document.getElementById('watchlistBtn');
    const watchlistSidebar = document.getElementById('watchlistSidebar');
    const closeWatchlist = document.getElementById('closeWatchlist');
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('watchlistModal');
    const closeModal = document.getElementById('closeModal');
    
    // 워치리스트 사이드바 열기
    watchlistBtn.addEventListener('click', () => {
        watchlistSidebar.classList.add('active');
        overlay.classList.add('active');
        updateWatchlistUI();
    });
    
    // 워치리스트 사이드바 닫기
    closeWatchlist.addEventListener('click', () => {
        watchlistSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // 오버레이 클릭 시 닫기
    overlay.addEventListener('click', () => {
        watchlistSidebar.classList.remove('active');
        modal.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // 워치리스트 추가 버튼
    addToWatchlistBtn.addEventListener('click', () => {
        if (!currentCompanyData) {
            alert('기업 정보를 먼저 조회해주세요.');
            return;
        }
        
        if (WatchlistManager.hasCompany(currentCompanyData.corpName)) {
            alert('이미 워치리스트에 추가된 기업입니다.');
            return;
        }
        
        WatchlistManager.addCompany({
            corpName: currentCompanyData.corpName,
            corpCode: currentCompanyData.corpCode || ''
        });
        
        updateWatchlistCount();
        updateWatchlistButton();
        alert(`${currentCompanyData.corpName}이(가) 워치리스트에 추가되었습니다.`);
    });
    
    // 모달 닫기
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // 모달 내 버튼들
    setupModalEvents();
    
    // 초기 카운트 업데이트
    updateWatchlistCount();
}

// 워치리스트 UI 업데이트
function updateWatchlistUI() {
    const watchlist = WatchlistManager.getAll();
    const emptyDiv = document.getElementById('watchlistEmpty');
    const itemsDiv = document.getElementById('watchlistItems');
    
    if (watchlist.length === 0) {
        emptyDiv.style.display = 'block';
        itemsDiv.innerHTML = '';
        return;
    }
    
    emptyDiv.style.display = 'none';
    itemsDiv.innerHTML = watchlist.map(item => `
        <div class="watchlist-item ${item.bookmark ? 'bookmarked' : ''}" 
             onclick="openWatchlistModal('${item.id}')">
            <div class="watchlist-item-header">
                <span class="watchlist-item-name">${item.corpName}</span>
            </div>
            <div class="watchlist-item-date">
                추가일: ${new Date(item.addedDate).toLocaleDateString('ko-KR')}
            </div>
            ${item.tags.length > 0 ? `
                <div class="watchlist-item-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            ${item.memo ? `
                <div class="watchlist-item-memo">${item.memo}</div>
            ` : ''}
        </div>
    `).join('');
}

// 워치리스트 카운트 업데이트
function updateWatchlistCount() {
    const count = WatchlistManager.getAll().length;
    document.getElementById('watchlistCount').textContent = count;
}

// 워치리스트 추가 버튼 상태 업데이트
function updateWatchlistButton() {
    const btn = document.getElementById('addToWatchlistBtn');
    if (!currentCompanyData) return;
    
    const inWatchlist = WatchlistManager.hasCompany(currentCompanyData.corpName);
    if (inWatchlist) {
        btn.textContent = '✅ 워치리스트에 추가됨';
        btn.classList.add('in-watchlist');
        btn.disabled = true;
    } else {
        btn.textContent = '⭐ 관심 기업 추가';
        btn.classList.remove('in-watchlist');
        btn.disabled = false;
    }
}

// 워치리스트 모달 열기
function openWatchlistModal(itemId) {
    const item = WatchlistManager.getCompany(itemId);
    if (!item) return;
    
    currentWatchlistItemId = itemId;
    
    const modal = document.getElementById('watchlistModal');
    const overlay = document.getElementById('overlay');
    
    // 기업명 설정
    document.getElementById('modalCompanyName').textContent = item.corpName;
    
    // 북마크 버튼 상태
    const bookmarkBtn = document.getElementById('modalBookmarkBtn');
    bookmarkBtn.textContent = item.bookmark ? '★ 북마크됨' : '☆ 북마크';
    bookmarkBtn.classList.toggle('bookmarked', item.bookmark);
    
    // 태그 표시
    updateModalTags(item.tags);
    
    // 메모 표시
    document.getElementById('modalMemo').value = item.memo || '';
    
    // 알림 목록 표시
    updateModalAlerts(item.alerts);
    
    // 재무 데이터 표시
    updateModalFinancialData(item.latestData);
    
    // 모달 표시
    modal.classList.add('active');
    overlay.classList.add('active');
}

// 모달 태그 업데이트
function updateModalTags(tags) {
    const container = document.getElementById('modalTags');
    container.innerHTML = tags.map(tag => `
        <span class="tag-removable">
            ${tag}
            <button onclick="removeTag('${tag}')">×</button>
        </span>
    `).join('');
}

// 모달 알림 업데이트
function updateModalAlerts(alerts) {
    const list = document.getElementById('alertList');
    if (alerts.length === 0) {
        list.innerHTML = '<p class="text-muted">설정된 알림이 없습니다</p>';
        return;
    }
    
    const metricNames = {
        debtRatio: '부채비율',
        equityRatio: '자기자본비율',
        currentRatio: '유동비율',
        roe: 'ROE'
    };
    
    const conditionNames = {
        above: '이상',
        below: '이하'
    };
    
    list.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.enabled ? '' : 'disabled'}">
            <div class="alert-item-text">
                ${metricNames[alert.metric]} ${alert.threshold}% ${conditionNames[alert.condition]}
            </div>
            <div class="alert-item-actions">
                <button class="btn btn-sm" onclick="toggleAlert('${alert.id}')">
                    ${alert.enabled ? '활성' : '비활성'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeAlert('${alert.id}')">
                    삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 모달 재무 데이터 업데이트
function updateModalFinancialData(data) {
    const container = document.getElementById('modalFinancialData');
    
    if (!data) {
        container.innerHTML = '<p class="text-muted">데이터가 없습니다</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="financial-summary-grid">
            <div class="financial-summary-item">
                <label>부채비율</label>
                <div class="value">${data.debtRatio ? data.debtRatio.toFixed(2) + '%' : '-'}</div>
            </div>
            <div class="financial-summary-item">
                <label>자기자본비율</label>
                <div class="value">${data.equityRatio ? data.equityRatio.toFixed(2) + '%' : '-'}</div>
            </div>
            <div class="financial-summary-item">
                <label>유동비율</label>
                <div class="value">${data.currentRatio ? data.currentRatio.toFixed(2) + '%' : '-'}</div>
            </div>
            <div class="financial-summary-item">
                <label>ROE</label>
                <div class="value">${data.roe ? data.roe.toFixed(2) + '%' : '-'}</div>
            </div>
        </div>
    `;
}

// 모달 이벤트 설정
function setupModalEvents() {
    // 북마크 토글
    document.getElementById('modalBookmarkBtn').addEventListener('click', () => {
        if (!currentWatchlistItemId) return;
        
        const bookmarked = WatchlistManager.toggleBookmark(currentWatchlistItemId);
        const btn = document.getElementById('modalBookmarkBtn');
        btn.textContent = bookmarked ? '★ 북마크됨' : '☆ 북마크';
        btn.classList.toggle('bookmarked', bookmarked);
        updateWatchlistUI();
    });
    
    // 태그 추가
    document.getElementById('tagInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && currentWatchlistItemId) {
            const input = e.target;
            const tag = input.value.trim();
            if (tag) {
                WatchlistManager.addTag(currentWatchlistItemId, tag);
                input.value = '';
                const item = WatchlistManager.getCompany(currentWatchlistItemId);
                updateModalTags(item.tags);
                updateWatchlistUI();
            }
        }
    });
    
    // 알림 추가
    document.getElementById('addAlertBtn').addEventListener('click', () => {
        if (!currentWatchlistItemId) return;
        
        const metric = document.getElementById('alertMetric').value;
        const condition = document.getElementById('alertCondition').value;
        const threshold = parseFloat(document.getElementById('alertThreshold').value);
        
        if (!metric || !threshold) {
            alert('지표와 임계값을 입력해주세요.');
            return;
        }
        
        WatchlistManager.addAlert(currentWatchlistItemId, { metric, condition, threshold });
        
        // 폼 초기화
        document.getElementById('alertMetric').value = '';
        document.getElementById('alertThreshold').value = '';
        
        // 알림 목록 업데이트
        const item = WatchlistManager.getCompany(currentWatchlistItemId);
        updateModalAlerts(item.alerts);
    });
    
    // 워치리스트에서 제거
    document.getElementById('removeFromWatchlist').addEventListener('click', () => {
        if (!currentWatchlistItemId) return;
        
        const item = WatchlistManager.getCompany(currentWatchlistItemId);
        if (confirm(`${item.corpName}을(를) 워치리스트에서 제거하시겠습니까?`)) {
            WatchlistManager.removeCompany(currentWatchlistItemId);
            document.getElementById('watchlistModal').classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
            updateWatchlistUI();
            updateWatchlistCount();
            updateWatchlistButton();
        }
    });
    
    // 저장 (메모 저장)
    document.getElementById('saveModal').addEventListener('click', () => {
        if (!currentWatchlistItemId) return;
        
        const memo = document.getElementById('modalMemo').value;
        WatchlistManager.updateMemo(currentWatchlistItemId, memo);
        updateWatchlistUI();
        alert('저장되었습니다.');
    });
}

// 태그 제거
function removeTag(tag) {
    if (currentWatchlistItemId) {
        WatchlistManager.removeTag(currentWatchlistItemId, tag);
        const item = WatchlistManager.getCompany(currentWatchlistItemId);
        updateModalTags(item.tags);
        updateWatchlistUI();
    }
}

// 알림 토글
function toggleAlert(alertId) {
    if (currentWatchlistItemId) {
        WatchlistManager.toggleAlert(currentWatchlistItemId, alertId);
        const item = WatchlistManager.getCompany(currentWatchlistItemId);
        updateModalAlerts(item.alerts);
    }
}

// 알림 제거
function removeAlert(alertId) {
    if (currentWatchlistItemId && confirm('이 알림을 삭제하시겠습니까?')) {
        WatchlistManager.removeAlert(currentWatchlistItemId, alertId);
        const item = WatchlistManager.getCompany(currentWatchlistItemId);
        updateModalAlerts(item.alerts);
    }
}

// =====================================================
// 투자 지표 계산 및 표시
// =====================================================

// 투자 지표 초기화
function initInvestmentMetrics() {
    const calculateBtn = document.getElementById('calculateMetricsBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateInvestmentMetrics);
    }
}

// 주식 데이터 자동 불러오기
async function loadStockDataAutomatically() {
    if (!currentCompanyData) {
        return;
    }

    const corpName = currentCompanyData.corpName;

    try {
        console.log(`주식 정보 자동 로딩 중: ${corpName}`);

        // Stock API 호출
        const result = await StockAPI.getStockInfo(corpName);

        if (!result || !result.success) {
            console.warn('주식 정보를 찾을 수 없습니다:', result?.message);
            return;
        }

        const stockInfo = result.data;
        console.log('주식 데이터 조회 완료:', stockInfo);

        // 폼 필드 자동 입력
        const stockPriceInput = document.getElementById('stockPrice');
        const totalSharesInput = document.getElementById('totalShares');
        const dividendPerShareInput = document.getElementById('dividendPerShare');

        if (stockInfo.stockPrice && stockPriceInput) {
            stockPriceInput.value = Math.round(stockInfo.stockPrice);
            console.log('주가 입력:', stockInfo.stockPrice);
        }

        if (stockInfo.totalShares && totalSharesInput) {
            totalSharesInput.value = Math.round(stockInfo.totalShares);
            console.log('발행주식수 입력:', stockInfo.totalShares);
        }

        if (stockInfo.dividendPerShare !== undefined && dividendPerShareInput) {
            dividendPerShareInput.value = Math.round(stockInfo.dividendPerShare);
            console.log('주당배당금 입력:', stockInfo.dividendPerShare);
        }

        console.log('✅ 주식 정보 자동 로딩 완료');

        // 데이터가 모두 입력되었으면 자동으로 지표 계산
        if (stockInfo.stockPrice && stockInfo.totalShares) {
            setTimeout(() => {
                console.log('투자 지표 자동 계산 시작');
                calculateInvestmentMetrics();
            }, 500);
        }

    } catch (error) {
        console.error('주식 데이터 불러오기 실패:', error);
    }
}

// 투자 지표 계산
function calculateInvestmentMetrics() {
    if (!currentFinancialData) {
        alert('먼저 재무정보를 조회해주세요.');
        return;
    }

    // 입력값 가져오기
    const stockPrice = parseFloat(document.getElementById('stockPrice').value);
    const totalShares = parseFloat(document.getElementById('totalShares').value);
    const dividendPerShare = parseFloat(document.getElementById('dividendPerShare').value) || 0;

    // 유효성 검사
    if (!stockPrice || stockPrice <= 0) {
        alert('현재 주가를 입력해주세요.');
        document.getElementById('stockPrice').focus();
        return;
    }

    if (!totalShares || totalShares <= 0) {
        alert('발행주식수를 입력해주세요.');
        document.getElementById('totalShares').focus();
        return;
    }

    // 재무 데이터 준비
    const data = {
        // 재무제표 데이터
        netIncome: currentFinancialData['당기순이익'] || 0,
        equity: currentFinancialData['자본총계'] || 0,
        revenue: currentFinancialData['매출액'] || 0,
        operatingIncome: currentFinancialData['영업이익'] || 0,
        debt: (currentFinancialData['단기차입금'] || 0) + (currentFinancialData['장기차입금'] || 0),
        cash: currentFinancialData['현금및현금성자산'] || 0,
        
        // 주가 데이터
        stockPrice: stockPrice,
        shares: totalShares,
        dividendPerShare: dividendPerShare
    };

    // 투자 지표 계산
    const metrics = InvestmentMetrics.calculateAllMetrics(data);

    // UI 표시
    displayInvestmentMetrics(metrics);
    
    // 투자 지표를 currentCompanyData에 저장
    if (currentCompanyData) {
        currentCompanyData.per = metrics.per;
        currentCompanyData.pbr = metrics.pbr;
        currentCompanyData.psr = metrics.psr;
        currentCompanyData.evToEbitda = metrics.evToEbitda;
        currentCompanyData.dividendYield = metrics.dividendYield;
    }
    
    // 건전성 점수 재계산
    calculateAndDisplayHealthScore();
}

// 투자 지표 UI 표시
function displayInvestmentMetrics(metrics) {
    // 섹션 표시
    const section = document.getElementById('investmentMetricsSection');
    section.classList.remove('hidden');

    // 시가총액
    document.getElementById('marketCapValue').textContent = 
        InvestmentMetrics.formatLargeNumber(metrics.marketCap);
    document.getElementById('marketCapBadge').textContent = 
        '₩' + InvestmentMetrics.formatLargeNumber(metrics.marketCap);

    // PER
    const perEval = InvestmentMetrics.evaluateMetric('per', metrics.per);
    const perValueEl = document.getElementById('perValue');
    const perBadgeEl = document.getElementById('perBadge');
    const perEvalEl = document.getElementById('perEval');
    
    if (perValueEl) perValueEl.textContent = InvestmentMetrics.formatNumber(metrics.per);
    if (perBadgeEl) {
        perBadgeEl.textContent = perEval.rating;
        perBadgeEl.style.backgroundColor = perEval.color;
        perBadgeEl.style.color = 'white';
    }
    if (perEvalEl) {
        perEvalEl.textContent = perEval.message;
        perEvalEl.className = 'metric-eval ' + getRatingClass(perEval.rating);
    }

    // PBR
    const pbrEval = InvestmentMetrics.evaluateMetric('pbr', metrics.pbr);
    const pbrValueEl = document.getElementById('pbrValue');
    const pbrBadgeEl = document.getElementById('pbrBadge');
    const pbrEvalEl = document.getElementById('pbrEval');
    
    if (pbrValueEl) pbrValueEl.textContent = InvestmentMetrics.formatNumber(metrics.pbr);
    if (pbrBadgeEl) {
        pbrBadgeEl.textContent = pbrEval.rating;
        pbrBadgeEl.style.backgroundColor = pbrEval.color;
        pbrBadgeEl.style.color = 'white';
    }
    if (pbrEvalEl) {
        pbrEvalEl.textContent = pbrEval.message;
        pbrEvalEl.className = 'metric-eval ' + getRatingClass(pbrEval.rating);
    }

    // PSR
    const psrEval = InvestmentMetrics.evaluateMetric('psr', metrics.psr);
    const psrValueEl = document.getElementById('psrValue');
    const psrBadgeEl = document.getElementById('psrBadge');
    const psrEvalEl = document.getElementById('psrEval');
    
    if (psrValueEl) psrValueEl.textContent = InvestmentMetrics.formatNumber(metrics.psr);
    if (psrBadgeEl) {
        psrBadgeEl.textContent = psrEval.rating;
        psrBadgeEl.style.backgroundColor = psrEval.color;
        psrBadgeEl.style.color = 'white';
    }
    if (psrEvalEl) {
        psrEvalEl.textContent = psrEval.message;
        psrEvalEl.className = 'metric-eval ' + getRatingClass(psrEval.rating);
    }

    // EV/EBITDA
    const evEval = InvestmentMetrics.evaluateMetric('evToEbitda', metrics.evToEbitda);
    const evValueEl = document.getElementById('evEbitdaValue');
    const evBadgeEl = document.getElementById('evEbitdaBadge');
    const evEvalEl = document.getElementById('evEbitdaEval');
    
    if (evValueEl) evValueEl.textContent = InvestmentMetrics.formatNumber(metrics.evToEbitda);
    if (evBadgeEl) {
        evBadgeEl.textContent = evEval.rating;
        evBadgeEl.style.backgroundColor = evEval.color;
        evBadgeEl.style.color = 'white';
    }
    if (evEvalEl) {
        evEvalEl.textContent = evEval.message;
        evEvalEl.className = 'metric-eval ' + getRatingClass(evEval.rating);
    }

    // 배당수익률
    if (metrics.dividendYield) {
        const divEval = InvestmentMetrics.evaluateMetric('dividendYield', metrics.dividendYield);
        const divValueEl = document.getElementById('dividendYieldValue');
        const divBadgeEl = document.getElementById('dividendYieldBadge');
        const divEvalEl = document.getElementById('dividendYieldEval');
        
        if (divValueEl) divValueEl.textContent = InvestmentMetrics.formatNumber(metrics.dividendYield) + '%';
        if (divBadgeEl) {
            divBadgeEl.textContent = divEval.rating;
            divBadgeEl.style.backgroundColor = divEval.color;
            divBadgeEl.style.color = 'white';
        }
        if (divEvalEl) {
            divEvalEl.textContent = divEval.message;
            divEvalEl.className = 'metric-eval ' + getRatingClass(divEval.rating);
        }
    } else {
        const divValueEl = document.getElementById('dividendYieldValue');
        const divBadgeEl = document.getElementById('dividendYieldBadge');
        const divEvalEl = document.getElementById('dividendYieldEval');
        
        if (divValueEl) divValueEl.textContent = '-';
        if (divBadgeEl) divBadgeEl.textContent = 'N/A';
        if (divEvalEl) divEvalEl.textContent = '배당 정보 없음';
    }

    // EPS
    document.getElementById('epsValue').textContent = 
        '₩' + InvestmentMetrics.formatNumber(metrics.eps, 0);

    // BPS
    document.getElementById('bpsValue').textContent = 
        '₩' + InvestmentMetrics.formatNumber(metrics.bps, 0);

    // 결과로 스크롤
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 평가 등급에 따른 CSS 클래스 반환
function getRatingClass(rating) {
    const negativeRatings = ['매우 저평가', '저평가', '낮음'];
    const positiveRatings = ['고평가', '다소 고평가', '양호', '우수'];
    const warningRatings = ['적정', '보통'];
    
    if (negativeRatings.includes(rating)) return 'negative';
    if (positiveRatings.includes(rating)) return 'positive';
    if (warningRatings.includes(rating)) return 'warning';
    return 'neutral';
}

// =====================================================
// 재무 건전성 점수 기능
// =====================================================

// 건전성 점수 계산 및 표시
function calculateAndDisplayHealthScore() {
    const healthSection = document.getElementById('healthScoreSection');
    
    if (!currentFinancialData || !currentCompanyData) {
        healthSection.style.display = 'none';
        return;
    }

    // 투자 지표가 계산되어 있는지 확인
    const hasInvestmentMetrics = currentCompanyData.per !== undefined;
    
    // 실제 재무 데이터 추출
    const revenue = currentFinancialData['매출액'] || 0;
    const operatingIncome = currentFinancialData['영업이익'] || 0;
    const totalAssets = currentFinancialData['자산총계'] || 0;
    const equity = currentFinancialData['자본총계'] || 0;
    
    // 영업이익률 계산
    const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
    
    // 자산 증가율 추정 (ROE 기반)
    const roe = currentCompanyData.roe || 0;
    const assetGrowth = roe > 0 ? roe * 0.5 : 0;  // 보수적 추정
    
    // 건전성 점수 계산 - 실제 재무 데이터 포함
    const healthData = {
        // 기본 비율
        roe: currentCompanyData.roe || 0,
        debtRatio: currentCompanyData.debtRatio || 0,
        currentRatio: currentCompanyData.currentRatio || 0,
        
        // 투자 지표
        per: hasInvestmentMetrics ? currentCompanyData.per : 0,
        pbr: hasInvestmentMetrics ? currentCompanyData.pbr : 0,
        
        // 실제 재무 데이터
        operatingMargin: operatingMargin,
        assetGrowth: assetGrowth,
        revenue: revenue,
        operatingIncome: operatingIncome,
        totalAssets: totalAssets,
        equity: equity
    };
    
    console.log('건전성 점수 계산 데이터:', healthData);
    
    const healthScore = FinancialHealth.calculateHealthScore(healthData);
    console.log('건전성 점수 결과:', healthScore);
    
    // 섹션 표시
    healthSection.style.display = 'block';
    
    // 종합 점수 표시
    displayHealthScore(healthScore);
    
    // 카테고리별 점수 표시
    displayCategoryScores(healthScore.category);
    
    // 종합 분석 표시
    displayHealthAnalysis(healthScore.analysis);
    
    // 투자 추천 표시
    displayRecommendation(healthScore.recommendation);
}

// 종합 점수 게이지 표시
function displayHealthScore(healthScore) {
    const scoreValue = document.getElementById('healthScoreValue');
    const gradeBadge = document.getElementById('healthGrade');
    const gaugeProgress = document.getElementById('gaugeProgress');
    
    // 점수 애니메이션
    let currentScore = 0;
    const targetScore = healthScore.totalScore;
    const duration = 1500;
    const steps = 60;
    const increment = targetScore / steps;
    
    const scoreInterval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);
        }
        scoreValue.textContent = Math.round(currentScore);
    }, duration / steps);
    
    // 등급 표시
    gradeBadge.textContent = healthScore.grade;
    gradeBadge.style.background = `linear-gradient(135deg, ${FinancialHealth.getGradeColor(healthScore.grade)}, ${FinancialHealth.getGradeColor(healthScore.grade)}dd)`;
    
    // 게이지 애니메이션 (251.2는 반원의 둘레)
    const progress = (healthScore.totalScore / 100) * 251.2;
    gaugeProgress.style.strokeDashoffset = 251.2 - progress;
    gaugeProgress.style.stroke = FinancialHealth.getGradeColor(healthScore.grade);
}

// 카테고리별 점수 표시
function displayCategoryScores(categories) {
    const categoryKeys = {
        profitability: { name: '수익성', maxScore: 30 },
        stability: { name: '안정성', maxScore: 30 },
        growth: { name: '성장성', maxScore: 20 },
        valuation: { name: '밸류에이션', maxScore: 20 }
    };
    
    Object.entries(categoryKeys).forEach(([key, info]) => {
        const category = categories[key];
        
        // 점수 표시
        document.getElementById(`${key}Score`).textContent = `${Math.round(category.score)}/${info.maxScore}`;
        document.getElementById(`${key}Percent`).textContent = `${category.percentage}%`;
        
        // 진행 바 애니메이션
        setTimeout(() => {
            document.getElementById(`${key}Bar`).style.width = `${category.percentage}%`;
        }, 100);
        
        // 요약 표시
        document.getElementById(`${key}Summary`).textContent = category.summary;
        
        // 상세 정보 표시
        const detailsContainer = document.getElementById(`${key}Details`);
        detailsContainer.innerHTML = category.details.map(detail => `
            <div class="detail-item">
                <span class="detail-metric">${detail.metric}</span>
                <span class="detail-value">${typeof detail.value === 'number' ? detail.value.toFixed(2) : detail.value}</span>
                <span class="detail-rating ${getRatingClass(detail.rating)}">${detail.rating}</span>
            </div>
        `).join('');
    });
}

// 건전성 분석 표시
function displayHealthAnalysis(analysis) {
    const analysisContainer = document.getElementById('healthAnalysis');
    
    const iconMap = {
        strength: '✅',
        weakness: '⚠️',
        overall: '📊'
    };
    
    analysisContainer.innerHTML = analysis.map(item => `
        <div class="analysis-item ${item.type}">
            <div class="analysis-icon">${iconMap[item.type]}</div>
            <div class="analysis-message">${item.message}</div>
        </div>
    `).join('');
}

// 투자 추천 표시
function displayRecommendation(recommendation) {
    document.getElementById('recommendationRating').textContent = recommendation.rating;
    document.getElementById('recommendationReason').textContent = recommendation.reason;
}

// 상세 평가 등급 CSS 클래스
function getRatingClass(rating) {
    if (rating.includes('매우 우수') || rating.includes('매우 안정') || rating.includes('매우 저평가')) return 'excellent';
    if (rating.includes('우수') || rating.includes('안정') || rating.includes('저평가') || rating.includes('고성장')) return 'good';
    if (rating.includes('양호') || rating.includes('적정') || rating.includes('성장')) return 'fair';
    if (rating.includes('주의') || rating.includes('보통') || rating.includes('고평가')) return 'caution';
    return 'poor';
}

// =====================================================
// 뉴스 & 공시 기능
// =====================================================

// 뉴스 초기화
function initNews() {
    // 탭 전환 이벤트
    const newsTabs = document.querySelectorAll('.news-tab');
    newsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tabName = tab.dataset.tab;
            switchNewsTab(tabName);
        });
    });
}

// 뉴스 탭 전환
function switchNewsTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll('.news-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // 콘텐츠 표시
    document.getElementById('newsTab').classList.toggle('active', tabName === 'news');
    document.getElementById('disclosureTab').classList.toggle('active', tabName === 'disclosure');
}

// 뉴스 로드
async function loadNews(companyName) {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '<div class="news-loading"><div class="spinner"></div><p>뉴스를 불러오는 중...</p></div>';
    
    try {
        const news = await NewsAPI.searchNaverNews(companyName, 5);
        displayNews(news);
    } catch (error) {
        console.error('뉴스 로드 실패:', error);
        newsList.innerHTML = '<div class="news-empty"><div class="news-empty-icon">📰</div><p>뉴스를 불러올 수 없습니다.</p></div>';
    }
}

// 뉴스 표시
function displayNews(news) {
    const newsList = document.getElementById('newsList');
    
    if (!news || news.length === 0) {
        newsList.innerHTML = '<div class="news-empty"><div class="news-empty-icon">📰</div><p>관련 뉴스가 없습니다.</p></div>';
        return;
    }
    
    newsList.innerHTML = news.map(item => `
        <div class="news-item">
            <div class="news-header">
                <h3 class="news-title">${item.title}</h3>
                <span class="news-time">${NewsAPI.getRelativeTime(item.pubDate)}</span>
            </div>
            <p class="news-description">${item.description}</p>
            <div class="news-footer">
                <span class="news-source">${item.source}</span>
                <a href="${item.link}" class="news-link" target="_blank">
                    자세히 보기 →
                </a>
            </div>
        </div>
    `).join('');
}

// 공시 로드
async function loadDisclosure(corpCode) {
    const disclosureList = document.getElementById('disclosureList');
    disclosureList.innerHTML = '<div class="news-loading"><div class="spinner"></div><p>공시 정보를 불러오는 중...</p></div>';
    
    try {
        // 최근 3개월 공시 조회
        const endDate = new Date();
        const beginDate = new Date();
        beginDate.setMonth(beginDate.getMonth() - 3);
        
        const endDateStr = endDate.toISOString().slice(0, 10).replace(/-/g, '');
        const beginDateStr = beginDate.toISOString().slice(0, 10).replace(/-/g, '');
        
        const disclosure = await NewsAPI.searchDartDisclosure(corpCode, beginDateStr, endDateStr);
        displayDisclosure(disclosure);
    } catch (error) {
        console.error('공시 로드 실패:', error);
        disclosureList.innerHTML = '<div class="news-empty"><div class="news-empty-icon">📋</div><p>공시 정보를 불러올 수 없습니다.</p></div>';
    }
}

// 공시 표시
function displayDisclosure(disclosure) {
    const disclosureList = document.getElementById('disclosureList');
    
    if (!disclosure || disclosure.length === 0) {
        disclosureList.innerHTML = '<div class="news-empty"><div class="news-empty-icon">📋</div><p>최근 공시가 없습니다.</p></div>';
        return;
    }
    
    const typeIcons = {
        financial: '📊',
        dividend: '💰',
        capital: '💵',
        merger: '🤝',
        disclosure: '📢',
        other: '📄'
    };
    
    disclosureList.innerHTML = disclosure.map(item => `
        <div class="disclosure-item" onclick="window.open('${item.link}', '_blank')">
            <div class="disclosure-type ${item.type}">
                ${typeIcons[item.type] || typeIcons.other}
            </div>
            <div class="disclosure-content">
                <h3 class="disclosure-title">${item.title}</h3>
                <div class="disclosure-meta">
                    <span>${item.corpName}</span>
                    <span>${item.date}</span>
                    <span>${item.source}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    init();
    initWatchlistUI();
    initInvestmentMetrics();
    initNews();
});
