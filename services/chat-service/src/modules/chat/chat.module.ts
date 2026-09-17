import { Module }            from '@nestjs/common';
import { TypeOrmModule }     from '@nestjs/typeorm';
import { HttpModule }        from '@nestjs/axios';
import { Conversation }      from './entities/conversation.entity';
import { ChatController }    from './chat.controller';
import { ChatService }       from './chat.service';
import { ContextService,
         ProductCtx, MoleculeCtx,
         IndicationCtx, SideEffectCtx } from '../context/context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation, ProductCtx, MoleculeCtx, IndicationCtx, SideEffectCtx,
    ]),
    HttpModule.register({ timeout: 130000 }),
  ],
  controllers: [ChatController],
  providers:   [ChatService, ContextService],
})
export class ChatModule {}
