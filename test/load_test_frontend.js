#!/usr/bin/env node
/**
 * Test de charge Frontend - Simulation de 100 utilisateurs
 * Chaque utilisateur fait 20 requêtes/minute = 2000 requêtes/minute total
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration du test
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://127.0.0.1:8000';
const NUM_USERS = 100;
const REQUESTS_PER_USER_PER_MINUTE = 20;
const TEST_DURATION_MINUTES = 5;

// Endpoints à tester (pondérés par fréquence d'usage)
const ENDPOINTS = [
    { path: '/api/produits/', weight: 25, method: 'GET' },
    { path: '/api/stocks/', weight: 20, method: 'GET' },
    { path: '/api/categories/', weight: 15, method: 'GET' },
    { path: '/api/fournisseurs/', weight: 10, method: 'GET' },
    { path: '/api/boutiques/', weight: 10, method: 'GET' },
    { path: '/api/factures/', weight: 8, method: 'GET' },
    { path: '/api/mouvements-stock/', weight: 4, method: 'GET' },
    { path: '/api/partenaires/', weight: 3, method: 'GET' },
    { path: '/api/subscription-plans/', weight: 2, method: 'GET' },
    { path: '/api/subscriptions/current/', weight: 2, method: 'GET' },
    { path: '/api/subscriptions/usage/', weight: 1, method: 'GET' },
];

class LoadTestResult {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.endpointsStats = {};
        this.frontendMetrics = [];
    }

    addResult(endpoint, method, statusCode, responseTime, error = null, frontendMetric = null) {
        const result = {
            timestamp: Date.now(),
            endpoint,
            method,
            statusCode,
            responseTime,
            error,
            frontendMetric
        };
        this.results.push(result);

        // Stats par endpoint
        if (!this.endpointsStats[endpoint]) {
            this.endpointsStats[endpoint] = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                responseTimes: [],
                statusCodes: {}
            };
        }

        const stats = this.endpointsStats[endpoint];
        stats.totalRequests++;
        stats.responseTimes.push(responseTime);

        if (statusCode === 200) {
            stats.successfulRequests++;
        } else {
            stats.failedRequests++;
        }

        stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;

        if (frontendMetric) {
            this.frontendMetrics.push(frontendMetric);
        }
    }

    getSummary() {
        if (this.results.length === 0) return {};

        const totalRequests = this.results.length;
        const successfulRequests = this.results.filter(r => r.statusCode === 200).length;
        const failedRequests = totalRequests - successfulRequests;

        const responseTimes = this.results.map(r => r.responseTime);
        const duration = (Date.now() - this.startTime) / 1000;
        const requestsPerSecond = totalRequests / duration;

        return {
            testDurationSeconds: duration,
            totalRequests,
            successfulRequests,
            failedRequests,
            successRate: (successfulRequests / totalRequests * 100),
            requestsPerSecond,
            avgResponseTime: this.average(responseTimes),
            medianResponseTime: this.median(responseTimes),
            p95ResponseTime: this.percentile(responseTimes, 95),
            p99ResponseTime: this.percentile(responseTimes, 99),
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            endpointsStats: this.endpointsStats,
            frontendMetrics: this.frontendMetrics
        };
    }

    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    median(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    percentile(arr, percentile) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentile / 100) - 1;
        return sorted[Math.max(0, index)];
    }
}

function selectEndpoint() {
    const totalWeight = ENDPOINTS.reduce((sum, ep) => sum + ep.weight, 0);
    let randomValue = Math.random() * totalWeight;

    for (const endpoint of ENDPOINTS) {
        randomValue -= endpoint.weight;
        if (randomValue <= 0) {
            return endpoint;
        }
    }
    return ENDPOINTS[0];
}

async function simulateUser(page, userId, result, authToken = null) {
    const requestsPerSecond = REQUESTS_PER_USER_PER_MINUTE / 60;
    const interval = 1000 / requestsPerSecond; // en millisecondes
    const endTime = Date.now() + (TEST_DURATION_MINUTES * 60 * 1000);

    console.log(`👤 Utilisateur ${userId} démarré`);

    while (Date.now() < endTime) {
        const endpoint = selectEndpoint();
        const startTime = Date.now();

        try {
            // Mesurer les métriques frontend
            const frontendStart = Date.now();
            
            // Naviguer vers la page si nécessaire
            if (Math.random() < 0.1) { // 10% de chance de naviguer
                await page.goto(`${FRONTEND_URL}/produits`, { waitUntil: 'networkidle2' });
            }

            // Faire la requête API
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            let url = `${BACKEND_URL}${endpoint.path}`;
            if (!url.includes('?') && endpoint.path.includes('/api/stocks/')) {
                url += `?entrepot=${Math.floor(Math.random() * 10) + 1}`;
            }

            const response = await page.evaluate(async (url, headers) => {
                const start = performance.now();
                try {
                    const response = await fetch(url, { 
                        method: 'GET', 
                        headers 
                    });
                    const data = await response.text();
                    const end = performance.now();
                    return {
                        status: response.status,
                        responseTime: end - start,
                        success: response.ok
                    };
                } catch (error) {
                    const end = performance.now();
                    return {
                        status: 0,
                        responseTime: end - start,
                        success: false,
                        error: error.message
                    };
                }
            }, url, headers);

            const totalTime = Date.now() - startTime;
            const frontendTime = Date.now() - frontendStart;

            result.addResult(
                endpoint.path,
                endpoint.method,
                response.status,
                response.responseTime,
                response.error,
                {
                    userId,
                    frontendTime,
                    totalTime,
                    pageLoadTime: await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart)
                }
            );

        } catch (error) {
            const responseTime = Date.now() - startTime;
            result.addResult(
                endpoint.path,
                endpoint.method,
                0,
                responseTime,
                error.message
            );
        }

        // Attendre avant la prochaine requête
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    console.log(`✅ Utilisateur ${userId} terminé`);
}

async function getAuthToken(page) {
    try {
        await page.goto(`${FRONTEND_URL}/connexion`);
        
        // Remplir le formulaire de connexion
        await page.type('input[name="email"]', 'admin@example.com');
        await page.type('input[name="password"]', 'admin123');
        
        // Cliquer sur le bouton de connexion
        await page.click('button[type="submit"]');
        
        // Attendre la redirection
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Récupérer le token depuis localStorage
        const token = await page.evaluate(() => {
            return localStorage.getItem('access_token');
        });
        
        return token;
    } catch (error) {
        console.log('⚠️  Authentification échouée:', error.message);
        return null;
    }
}

async function runLoadTest() {
    console.log('🚀 Démarrage du test de charge Frontend');
    console.log(`   - Utilisateurs: ${NUM_USERS}`);
    console.log(`   - Requêtes par utilisateur/minute: ${REQUESTS_PER_USER_PER_MINUTE}`);
    console.log(`   - Durée: ${TEST_DURATION_MINUTES} minutes`);
    console.log(`   - Total estimé: ${NUM_USERS * REQUESTS_PER_USER_PER_MINUTE * TEST_DURATION_MINUTES} requêtes`);
    console.log();

    const result = new LoadTestResult();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Créer une page pour l'authentification
        const authPage = await browser.newPage();
        const authToken = await getAuthToken(authPage);
        await authPage.close();

        if (authToken) {
            console.log('✅ Authentification réussie');
        } else {
            console.log('⚠️  Authentification échouée, tests sans auth');
        }

        console.log(`📊 Démarrage de ${NUM_USERS} utilisateurs virtuels...`);

        // Créer les pages pour chaque utilisateur
        const pages = [];
        for (let i = 0; i < Math.min(NUM_USERS, 20); i++) { // Limiter à 20 pages simultanées
            const page = await browser.newPage();
            pages.push(page);
        }

        // Lancer les utilisateurs en parallèle
        const tasks = [];
        for (let i = 0; i < NUM_USERS; i++) {
            const page = pages[i % pages.length];
            tasks.push(simulateUser(page, i, result, authToken));
        }

        await Promise.all(tasks);

        // Fermer les pages
        for (const page of pages) {
            await page.close();
        }

    } finally {
        await browser.close();
    }

    return result;
}

function printResults(result) {
    const summary = result.get_summary();

    console.log('\n' + '='.repeat(60));
    console.log('📈 RÉSULTATS DU TEST DE CHARGE FRONTEND');
    console.log('='.repeat(60));

    console.log(`⏱️  Durée du test: ${summary.testDurationSeconds.toFixed(2)} secondes`);
    console.log(`📊 Total requêtes: ${summary.totalRequests}`);
    console.log(`✅ Requêtes réussies: ${summary.successfulRequests}`);
    console.log(`❌ Requêtes échouées: ${summary.failedRequests}`);
    console.log(`📈 Taux de succès: ${summary.successRate.toFixed(2)}%`);
    console.log(`🚀 Requêtes/seconde: ${summary.requestsPerSecond.toFixed(2)}`);

    console.log(`\n⏱️  TEMPS DE RÉPONSE BACKEND:`);
    console.log(`   Moyenne: ${summary.avgResponseTime.toFixed(3)}s`);
    console.log(`   Médiane: ${summary.medianResponseTime.toFixed(3)}s`);
    console.log(`   P95: ${summary.p95ResponseTime.toFixed(3)}s`);
    console.log(`   P99: ${summary.p99ResponseTime.toFixed(3)}s`);
    console.log(`   Min: ${summary.minResponseTime.toFixed(3)}s`);
    console.log(`   Max: ${summary.maxResponseTime.toFixed(3)}s`);

    // Métriques frontend
    if (summary.frontendMetrics.length > 0) {
        const frontendTimes = summary.frontendMetrics.map(m => m.frontendTime);
        const pageLoadTimes = summary.frontendMetrics.map(m => m.pageLoadTime).filter(t => t > 0);
        
        console.log(`\n🖥️  MÉTRIQUES FRONTEND:`);
        console.log(`   Temps frontend moyen: ${result.average(frontendTimes).toFixed(3)}s`);
        console.log(`   Temps de chargement page moyen: ${pageLoadTimes.length > 0 ? result.average(pageLoadTimes).toFixed(3) : 'N/A'}s`);
    }

    console.log(`\n📊 STATISTIQUES PAR ENDPOINT:`);
    for (const [endpoint, stats] of Object.entries(summary.endpointsStats)) {
        const successRate = (stats.successfulRequests / stats.totalRequests * 100);
        const avgTime = result.average(stats.responseTimes);

        console.log(`   ${endpoint}`);
        console.log(`     Requêtes: ${stats.totalRequests} | Succès: ${successRate.toFixed(1)}% | Temps moyen: ${avgTime.toFixed(3)}s`);
    }

    // Sauvegarder les résultats
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `frontend_load_test_results_${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify({
        summary,
        detailedResults: result.results
    }, null, 2));

    console.log(`\n💾 Résultats sauvegardés dans: ${filename}`);

    // Analyse des performances
    console.log(`\n🔍 ANALYSE DES PERFORMANCES:`);

    if (summary.successRate >= 95) {
        console.log('✅ Taux de succès: EXCELLENT');
    } else if (summary.successRate >= 90) {
        console.log('⚠️  Taux de succès: BON');
    } else {
        console.log('❌ Taux de succès: INSUFFISANT');
    }

    if (summary.avgResponseTime <= 0.5) {
        console.log('✅ Temps de réponse moyen: EXCELLENT');
    } else if (summary.avgResponseTime <= 1.0) {
        console.log('⚠️  Temps de réponse moyen: BON');
    } else {
        console.log('❌ Temps de réponse moyen: INSUFFISANT');
    }

    if (summary.p95ResponseTime <= 1.0) {
        console.log('✅ P95 temps de réponse: EXCELLENT');
    } else if (summary.p95ResponseTime <= 2.0) {
        console.log('⚠️  P95 temps de réponse: BON');
    } else {
        console.log('❌ P95 temps de réponse: INSUFFISANT');
    }

    // Recommandations
    console.log(`\n💡 RECOMMANDATIONS:`);
    if (summary.successRate < 95) {
        console.log('   - Optimiser la base de données (index, requêtes)');
        console.log('   - Augmenter les ressources serveur');
        console.log('   - Implémenter la mise en cache Redis');
    }

    if (summary.avgResponseTime > 1.0) {
        console.log('   - Optimiser les requêtes SQL');
        console.log('   - Implémenter la pagination');
        console.log('   - Utiliser la mise en cache côté serveur');
    }

    if (summary.p95ResponseTime > 2.0) {
        console.log('   - Optimiser les endpoints les plus lents');
        console.log('   - Implémenter la compression gzip');
        console.log('   - Utiliser un CDN pour les assets statiques');
    }

    // Recommandations spécifiques au frontend
    console.log(`\n🎨 RECOMMANDATIONS FRONTEND:`);
    console.log('   - Optimiser le cache avec TTL appropriés');
    console.log('   - Implémenter la déduplication des requêtes');
    console.log('   - Utiliser la pagination côté client');
    console.log('   - Optimiser les images et assets');
    console.log('   - Implémenter le lazy loading');
}

async function main() {
    try {
        const result = await runLoadTest();
        printResults(result);
    } catch (error) {
        console.error(`\n❌ Erreur lors du test: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { LoadTestResult, runLoadTest };
