#!/usr/bin/env node

/**
 * Smart Home IoT Unified Server (v2.0)
 *
 * This entrypoint preserves backward compatibility for legacy deployment
 * scripts (such as Heroku Procfile: 'web: node server.js') while running the
 * modern modular TypeScript architecture with full REST API, Anomaly Detection,
 * and Cross-Platform Web & Mobile client static serving.
 */

import './backend/dist/server.js';
