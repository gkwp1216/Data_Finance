// =====================================================
// 워치리스트 관리 시스템
// =====================================================

const WatchlistManager = {
    // localStorage 키
    STORAGE_KEY: 'financial-watchlist',
    
    // 워치리스트 데이터 구조
    watchlist: [],
    
    /**
     * 초기화
     */
    init() {
        this.loadFromStorage();
    },
    
    /**
     * localStorage에서 데이터 로드
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            this.watchlist = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('워치리스트 로드 실패:', error);
            this.watchlist = [];
        }
    },
    
    /**
     * localStorage에 데이터 저장
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.watchlist));
        } catch (error) {
            console.error('워치리스트 저장 실패:', error);
        }
    },
    
    /**
     * 기업 추가
     * @param {Object} company - 기업 정보
     * @returns {Object} 생성된 항목
     */
    addCompany(company) {
        const item = {
            id: `watch-${Date.now()}`,
            corpCode: company.corpCode || '',
            corpName: company.corpName,
            addedDate: new Date().toISOString(),
            memo: '',
            alerts: [],
            bookmark: false,
            tags: [],
            lastChecked: null,
            latestData: null // 마지막 조회한 재무 데이터
        };
        
        this.watchlist.push(item);
        this.saveToStorage();
        return item;
    },
    
    /**
     * 기업 삭제
     * @param {string} id - 워치리스트 항목 ID
     * @returns {boolean} 성공 여부
     */
    removeCompany(id) {
        const index = this.watchlist.findIndex(item => item.id === id);
        if (index !== -1) {
            this.watchlist.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    },
    
    /**
     * 기업이 워치리스트에 있는지 확인
     * @param {string} corpName - 기업명
     * @returns {boolean}
     */
    hasCompany(corpName) {
        return this.watchlist.some(item => item.corpName === corpName);
    },
    
    /**
     * 기업 정보 가져오기
     * @param {string} id - 워치리스트 항목 ID
     * @returns {Object|null}
     */
    getCompany(id) {
        return this.watchlist.find(item => item.id === id) || null;
    },
    
    /**
     * 전체 워치리스트 가져오기
     * @returns {Array}
     */
    getAll() {
        return [...this.watchlist];
    },
    
    /**
     * 북마크 토글
     * @param {string} id - 워치리스트 항목 ID
     * @returns {boolean} 새로운 북마크 상태
     */
    toggleBookmark(id) {
        const item = this.getCompany(id);
        if (item) {
            item.bookmark = !item.bookmark;
            this.saveToStorage();
            return item.bookmark;
        }
        return false;
    },
    
    /**
     * 메모 업데이트
     * @param {string} id - 워치리스트 항목 ID
     * @param {string} memo - 메모 내용
     */
    updateMemo(id, memo) {
        const item = this.getCompany(id);
        if (item) {
            item.memo = memo;
            this.saveToStorage();
        }
    },
    
    /**
     * 태그 추가
     * @param {string} id - 워치리스트 항목 ID
     * @param {string} tag - 태그
     */
    addTag(id, tag) {
        const item = this.getCompany(id);
        if (item && !item.tags.includes(tag)) {
            item.tags.push(tag);
            this.saveToStorage();
        }
    },
    
    /**
     * 태그 제거
     * @param {string} id - 워치리스트 항목 ID
     * @param {string} tag - 태그
     */
    removeTag(id, tag) {
        const item = this.getCompany(id);
        if (item) {
            item.tags = item.tags.filter(t => t !== tag);
            this.saveToStorage();
        }
    },
    
    /**
     * 알림 추가
     * @param {string} id - 워치리스트 항목 ID
     * @param {Object} alert - 알림 설정
     */
    addAlert(id, alert) {
        const item = this.getCompany(id);
        if (item) {
            const newAlert = {
                id: `alert-${Date.now()}`,
                metric: alert.metric, // 'debtRatio', 'currentRatio', 'roe' 등
                condition: alert.condition, // 'above', 'below'
                threshold: alert.threshold,
                enabled: true,
                createdDate: new Date().toISOString(),
                lastTriggered: null
            };
            item.alerts.push(newAlert);
            this.saveToStorage();
        }
    },
    
    /**
     * 알림 제거
     * @param {string} id - 워치리스트 항목 ID
     * @param {string} alertId - 알림 ID
     */
    removeAlert(id, alertId) {
        const item = this.getCompany(id);
        if (item) {
            item.alerts = item.alerts.filter(a => a.id !== alertId);
            this.saveToStorage();
        }
    },
    
    /**
     * 알림 토글
     * @param {string} id - 워치리스트 항목 ID
     * @param {string} alertId - 알림 ID
     */
    toggleAlert(id, alertId) {
        const item = this.getCompany(id);
        if (item) {
            const alert = item.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.enabled = !alert.enabled;
                this.saveToStorage();
            }
        }
    },
    
    /**
     * 재무 데이터 업데이트 및 알림 체크
     * @param {string} id - 워치리스트 항목 ID
     * @param {Object} financialData - 재무 데이터
     * @returns {Array} 트리거된 알림 목록
     */
    updateFinancialData(id, financialData) {
        const item = this.getCompany(id);
        if (!item) return [];
        
        item.lastChecked = new Date().toISOString();
        item.latestData = financialData;
        
        // 알림 체크
        const triggeredAlerts = [];
        item.alerts.forEach(alert => {
            if (!alert.enabled) return;
            
            const value = financialData[alert.metric];
            if (value === undefined) return;
            
            let triggered = false;
            if (alert.condition === 'above' && value > alert.threshold) {
                triggered = true;
            } else if (alert.condition === 'below' && value < alert.threshold) {
                triggered = true;
            }
            
            if (triggered) {
                alert.lastTriggered = new Date().toISOString();
                triggeredAlerts.push({
                    companyName: item.corpName,
                    alert: alert,
                    currentValue: value
                });
            }
        });
        
        this.saveToStorage();
        return triggeredAlerts;
    },
    
    /**
     * 북마크된 기업만 가져오기
     * @returns {Array}
     */
    getBookmarked() {
        return this.watchlist.filter(item => item.bookmark);
    },
    
    /**
     * 태그로 필터링
     * @param {string} tag - 태그
     * @returns {Array}
     */
    getByTag(tag) {
        return this.watchlist.filter(item => item.tags.includes(tag));
    },
    
    /**
     * 모든 태그 목록
     * @returns {Array}
     */
    getAllTags() {
        const tags = new Set();
        this.watchlist.forEach(item => {
            item.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    },
    
    /**
     * 전체 워치리스트 초기화
     */
    clearAll() {
        if (confirm('모든 워치리스트 데이터를 삭제하시겠습니까?')) {
            this.watchlist = [];
            this.saveToStorage();
        }
    },
    
    /**
     * 데이터 내보내기 (JSON)
     * @returns {string} JSON 문자열
     */
    exportData() {
        return JSON.stringify(this.watchlist, null, 2);
    },
    
    /**
     * 데이터 가져오기 (JSON)
     * @param {string} jsonString - JSON 문자열
     * @returns {boolean} 성공 여부
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                this.watchlist = data;
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
        }
        return false;
    }
};

// =====================================================
// 알림 관리자
// =====================================================

const AlertManager = {
    STORAGE_KEY: 'financial-alert-history',
    history: [],
    
    init() {
        this.loadHistory();
    },
    
    loadHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            this.history = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('알림 히스토리 로드 실패:', error);
            this.history = [];
        }
    },
    
    saveHistory() {
        try {
            // 최근 100개만 유지
            if (this.history.length > 100) {
                this.history = this.history.slice(-100);
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.error('알림 히스토리 저장 실패:', error);
        }
    },
    
    /**
     * 알림 기록 추가
     * @param {Object} alert - 트리거된 알림 정보
     */
    addToHistory(alert) {
        this.history.push({
            ...alert,
            timestamp: new Date().toISOString(),
            read: false
        });
        this.saveHistory();
    },
    
    /**
     * 알림 읽음 처리
     * @param {number} index - 히스토리 인덱스
     */
    markAsRead(index) {
        if (this.history[index]) {
            this.history[index].read = true;
            this.saveHistory();
        }
    },
    
    /**
     * 읽지 않은 알림 개수
     * @returns {number}
     */
    getUnreadCount() {
        return this.history.filter(item => !item.read).length;
    },
    
    /**
     * 최근 알림 가져오기
     * @param {number} limit - 개수 제한
     * @returns {Array}
     */
    getRecent(limit = 10) {
        return this.history.slice(-limit).reverse();
    },
    
    /**
     * 모든 알림 읽음 처리
     */
    markAllAsRead() {
        this.history.forEach(item => item.read = true);
        this.saveHistory();
    },
    
    /**
     * 히스토리 초기화
     */
    clearHistory() {
        if (confirm('모든 알림 기록을 삭제하시겠습니까?')) {
            this.history = [];
            this.saveHistory();
        }
    }
};

// 초기화
WatchlistManager.init();
AlertManager.init();

// 전역 노출
window.WatchlistManager = WatchlistManager;
window.AlertManager = AlertManager;
