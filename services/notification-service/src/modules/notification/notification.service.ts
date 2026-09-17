import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotifType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  // ─── CRÉER UNE NOTIFICATION ──────────────────────────────
  async create(dto: CreateNotificationDto) {
    const notif = this.notifRepo.create(dto);
    return this.notifRepo.save(notif);
  }

  // ─── BROADCAST À TOUS ────────────────────────────────────
  async broadcast(title: string, message: string, type: NotifType = NotifType.INFO) {
    const notif = this.notifRepo.create({ title, message, type });
    return this.notifRepo.save(notif);
  }

  // ─── MES NOTIFICATIONS ───────────────────────────────────
  async getMyNotifications(userId: number, unreadOnly = false) {
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('n.userId = :userId OR n.userId IS NULL', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(50);
    if (unreadOnly) qb.andWhere('n.isRead = false');
    const data = await qb.getMany();
    const unreadCount = data.filter(n => !n.isRead).length;
    return { data, unreadCount };
  }

  // ─── MARQUER COMME LU ────────────────────────────────────
  async markAsRead(userId: number, id: number) {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification introuvable');
    await this.notifRepo.update({ id }, { isRead: true });
    return { message: 'Marqué comme lu' };
  }

  async markAllAsRead(userId: number) {
    await this.notifRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .execute();
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  // ─── ALERTES SYSTÈME ─────────────────────────────────────
  async sendDrugAlert(productName: string, alertMessage: string) {
    return this.broadcast(
      `⚠️ Alerte médicament : ${productName}`,
      alertMessage,
      NotifType.ALERT,
    );
  }

  async sendInteractionAlert(userId: number, mol1: string, mol2: string) {
    return this.create({
      userId,
      title: '⚠️ Interaction médicamenteuse détectée',
      message: `Interaction potentielle entre ${mol1} et ${mol2}. Consultez votre médecin.`,
      type: NotifType.INTERACTION,
    });
  }

  async getStats() {
    const total    = await this.notifRepo.count();
    const unread   = await this.notifRepo.count({ where: { isRead: false } });
    const alerts   = await this.notifRepo.count({ where: { type: NotifType.ALERT } });
    return { total, unread, alerts };
  }
}
