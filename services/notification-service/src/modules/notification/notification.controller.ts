import { Controller, Get, Post, Put, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications & Alertes')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques notifications' })
  getStats() { return this.notificationService.getStats(); }

  @Post()
  @ApiOperation({ summary: 'Créer une notification' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Envoyer à tous les utilisateurs' })
  broadcast(@Body('title') title: string, @Body('message') message: string) {
    return this.notificationService.broadcast(title, message);
  }

  @Post('alert/drug')
  @ApiOperation({ summary: 'Alerte médicament' })
  drugAlert(
    @Body('productName') name: string,
    @Body('message') msg: string,
  ) { return this.notificationService.sendDrugAlert(name, msg); }

  @Post('alert/interaction')
  @ApiOperation({ summary: 'Alerte interaction pour un patient' })
  interactionAlert(
    @Body('userId') userId: number,
    @Body('mol1') mol1: string,
    @Body('mol2') mol2: string,
  ) { return this.notificationService.sendInteractionAlert(userId, mol1, mol2); }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Mes notifications' })
  getMine(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('unreadOnly') unreadOnly: boolean,
  ) { return this.notificationService.getMyNotifications(userId, unreadOnly); }

  @Put('user/:userId/read/:id')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  markRead(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) { return this.notificationService.markAsRead(userId, id); }

  @Put('user/:userId/read-all')
  @ApiOperation({ summary: 'Tout marquer comme lu' })
  markAllRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }
}
