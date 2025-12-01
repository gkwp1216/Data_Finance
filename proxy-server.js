// =====================================================
// 네이버 뉴스 API 프록시 서버
// =====================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// CORS 설정 (모든 출처 허용)
app.use(cors());
app.use(express.json());

// 네이버 API 키 설정
const NAVER_CLIENT_ID = 'Dzae9kwCMAsfyaN3rTrJ';
const NAVER_CLIENT_SECRET = 'rjK8xPVArj';

// 네이버 뉴스 API 프록시 엔드포인트
app.post('/api/proxy/naver-news', async (req, res) => {
    try {
        const { query, display = 10 } = req.body;
        
        console.log(`뉴스 검색: ${query}, 개수: ${display}`);
        
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: {
                query: query,
                display: display,
                sort: 'date'
            },
            headers: {
                'X-Naver-Client-Id': NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
            }
        });
        
        console.log(`✅ ${response.data.items.length}개의 뉴스를 찾았습니다.`);
        res.json(response.data);
    } catch (error) {
        console.error('❌ 네이버 API 오류:', error.response?.data || error.message);
        res.status(500).json({ 
            error: '뉴스를 불러올 수 없습니다.',
            message: error.message 
        });
    }
});

// DART 기업 목록 API 프록시 엔드포인트
app.get('/api/proxy/dart-corpcode', async (req, res) => {
    try {
        const apiKey = req.query.crtfc_key || 'a840a5ad65e360f78621fc44725022e66f951d3659cea20e297a7a1b21e2929a';
        
        console.log(`DART 기업 목록 다운로드 요청`);
        
        const response = await axios.get('https://opendart.fss.or.kr/api/corpCode.xml', {
            params: {
                crtfc_key: apiKey
            },
            responseType: 'text'
        });
        
        console.log(`✅ DART 기업 목록을 다운로드했습니다.`);
        res.set('Content-Type', 'application/xml');
        res.send(response.data);
    } catch (error) {
        console.error('❌ DART API 오류:', error.response?.data || error.message);
        res.status(500).json({ 
            error: '기업 목록을 불러올 수 없습니다.',
            message: error.message 
        });
    }
});

// 서버 상태 확인 엔드포인트
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '프록시 서버가 정상 작동 중입니다.',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('================================================');
    console.log(`🚀 네이버 뉴스 API 프록시 서버 실행 중`);
    console.log(`📡 포트: ${PORT}`);
    console.log(`🔗 엔드포인트: http://localhost:${PORT}/api/proxy/naver-news`);
    console.log(`💚 상태 확인: http://localhost:${PORT}/health`);
    console.log('================================================');
});
