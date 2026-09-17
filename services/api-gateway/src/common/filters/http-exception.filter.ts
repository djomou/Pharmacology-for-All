import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Gateway');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse();
    const req    = ctx.getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Erreur interne — service temporairement indisponible';

    this.logger.error(`${req.method} ${req.url} → ${status}`);

    res.status(status).json({
      success:    false,
      statusCode: status,
      message,
      path:       req.url,
      timestamp:  new Date().toISOString(),
    });
  }
}
