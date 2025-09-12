const axios = require('axios');
const Logger = require('../../utils/logger');
require('dotenv').config();

const baseUrl = process.env.OTAKUBASE_URL || 'https://otakudesu.best/';

class OtakudesuFetch {
    async getHomepageOtakudesu() {
        try {
            const res = await axios.get(baseUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error('Error fetching homepage:', error.message);
            return null;
        }
    }

    async getOngoingAnimeOtakudesu(page = 1) {
        try {
            const url = page === 1
                ? `${baseUrl}ongoing-anime`
                : `${baseUrl}ongoing-anime/page/${page}/`;

            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error(`Error fetching ongoing anime page ${page}:`, error.message);
            return null;
        }
    }

    async getCompleteAnimeOtakudesu(page = 1) {
        try {
            const url = page === 1
                ? `${baseUrl}complete-anime`
                : `${baseUrl}complete-anime/page/${page}/`;

            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error(`Error fetching complete anime page ${page}:`, error.message);
            return null;
        }
    }

    async getJadwalRilisAnimeOtakudesu() {
        try {
            const res = await axios.get(`${baseUrl}jadwal-rilis`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error('Error fetching release schedule:', error.message);
            return null;
        }
    }

    async getSearchAnimeOtakudesu(query) {
        try {
            const res = await axios.get(`${baseUrl}?s=${encodeURIComponent(query)}&post_type=anime`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error('Error fetching search anime:', error.message);
            return null;
        }
    }

    async getDetailAnimeOtakudesu(link) {
        try {
            const res = await axios.get(link, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error(`Error fetching detail anime (${link}):`, error.message);
            return null;
        }
    }

    async getDetailAnimeEpsOtakudesu(link) {
        try {
            const res = await axios.get(link, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error(`Error fetching episode detail (${link}):`, error.message);
            return null;
        }
    }

    async getGendreListOtakudesu() {
        try {
            const res = await axios.get(`${baseUrl}genre-list/`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error('Error fetching genre list:', error.message);
            return null;
        }
    }

    async getDetailGenre(link, page = 1) {
        try {
            const url = page === 1 ? link : `${link}/page/${page}/`;

            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            return res.data;
        } catch (error) {
            Logger.error(`Error fetching detail genre (${link}) page ${page}:`, error.message);
            return null;
        }
    }
}

module.exports = new OtakudesuFetch();

