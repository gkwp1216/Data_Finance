// 전역 변수
let apiKey = 'a840a5ad65e360f78621fc44725022e66f951d3659cea20e297a7a1b21e2929a';
let chartInstance = null;

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
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

// 재무정보 검색
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
    const baseAmount = Math.floor(Math.random() * 100000000000) + 50000000000;
    
    return {
        success: true,
        corpName: corpName,
        year: year,
        items: [
            { account_nm: '자산총계', thstrm_amount: baseAmount },
            { account_nm: '유동자산', thstrm_amount: Math.floor(baseAmount * 0.6) },
            { account_nm: '비유동자산', thstrm_amount: Math.floor(baseAmount * 0.4) },
            { account_nm: '부채총계', thstrm_amount: Math.floor(baseAmount * 0.45) },
            { account_nm: '유동부채', thstrm_amount: Math.floor(baseAmount * 0.25) },
            { account_nm: '비유동부채', thstrm_amount: Math.floor(baseAmount * 0.2) },
            { account_nm: '자본총계', thstrm_amount: Math.floor(baseAmount * 0.55) },
            { account_nm: '매출액', thstrm_amount: Math.floor(baseAmount * 0.8) },
            { account_nm: '영업이익', thstrm_amount: Math.floor(baseAmount * 0.12) },
            { account_nm: '당기순이익', thstrm_amount: Math.floor(baseAmount * 0.08) }
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

    // 재무비율 계산 및 표시
    const ratios = calculateAndDisplayRatios(financialData);

    // 테이블 생성
    createFinancialTable(data.items);

    // 차트 생성
    createFinancialChart(financialData);

    // 결과 섹션 표시
    elements.resultSection.classList.remove('hidden');
    
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
function loadCompanyData(corpName, corpCode) {
    elements.corpName.value = corpName;
    const bsnsYear = elements.bsnsYear.value;
    const reprtCode = elements.reprtCode.value;

    // 초기 레이아웃 숨기고 결과 레이아웃으로 전환
    document.getElementById('initialLayout').classList.add('hidden');
    document.getElementById('resultLayout').classList.remove('hidden');
    
    // 결과 페이지 검색 폼에도 값 동기화
    syncSearchForms(corpName, '', bsnsYear, reprtCode);

    showLoading(true);
    elements.resultSection.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');

    setTimeout(() => {
        const data = generateSampleData(corpName, bsnsYear);
        displayFinancialData(data);
        showLoading(false);
    }, 500);
}

// 결과 페이지에서 검색
function searchFinancialDataFromResult() {
    if (!apiKey) {
        showError('먼저 API 키를 저장해주세요.');
        return;
    }

    const corpName = elements.corpName2.value.trim();
    if (!corpName) {
        showError('기업명을 입력해주세요.');
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

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    init();
    initWatchlistUI();
});
