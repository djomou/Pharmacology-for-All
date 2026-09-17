import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { SERVICES_CONFIG } from '../config/services.config';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ProxyMiddleware');
  private readonly proxies: Map<string, any> = new Map();

  constructor() {
    for (const service of SERVICES_CONFIG) {
      const proxy = createProxyMiddleware({
        target:       service.url,
        changeOrigin: true,
        on: {
          error: (err: any, req: any, res: any) => {
            this.logger.error(`❌ ${service.name} indisponible : ${err.message}`);
            if (res && !res.headersSent) {
              res.status(503).json({
                success:    false,
                statusCode: 503,
                message:    `Service "${service.name}" temporairement indisponible`,
              });
            }
          },
        },
      });
      this.proxies.set(service.prefix, proxy);
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Headers CORS sur res — avant le proxy, une seule fois
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');

    // Preflight OPTIONS — répondre immédiatement
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // Router vers le bon microservice
    for (const service of SERVICES_CONFIG) {
      if (req.url.startsWith(service.prefix)) {
        this.logger.debug(`→ ${req.method} ${req.url} → ${service.name}`);
        const proxy = this.proxies.get(service.prefix);
        if (proxy) return proxy(req, res, next);
      }
    }
    next();
  }
}
