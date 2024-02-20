// Middleware to escape xss injection in all types of requests

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
class EscapeXssMiddleware implements NestMiddleware {
  escapeXssInjection = (str: string) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '=': '&#x3D;',
    };
    const reg = /[&<>"'=]/gi;
    return str.replace(reg, (match) => map[match]);
  };

  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const query = req.query;
    const params = req.params;
    if (body) {
      Object.keys(body).forEach((key) => {
        const value = body[key];
        if (typeof value === 'string') {
          body[key] = this.escapeXssInjection(value);
        }
      });
    }
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (typeof value === 'string') {
          query[key] = this.escapeXssInjection(value);
        }
      });
    }
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (typeof value === 'string') {
          params[key] = this.escapeXssInjection(value);
        }
      });
    }
    next();
  }
}

export default EscapeXssMiddleware;
