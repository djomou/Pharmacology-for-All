import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Conversation }   from './entities/conversation.entity';
import { ContextService } from '../context/context.service';
import { ChatMessageDto } from './dto/chat.dto';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL      = process.env.QWEN_MODEL  || 'qwen2.5:1.5b';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('ChatService');

  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,
    private contextService: ContextService,
    private httpService: HttpService,
  ) {}

  // ─── Prompt système ─────────────────────────────────────
  buildSystemPrompt(role: string, name: string, drugContext: string): string {
    const roleDesc = role === 'medecin'
      ? 'un médecin ou professionnel de santé. Tu peux utiliser une terminologie médicale plus technique'
      : 'un patient ou particulier. Tu utilises un langage simple et accessible à tous';

    return `Tu es MedocAssistant, un assistant médical intelligent et bienveillant intégré à la plateforme MedocCloudNative.

Tu t'adresses à ${name || 'un utilisateur'}, qui est ${roleDesc}.

TES CAPACITÉS:
- Tu as accès à une base de données de plus de 106 000 médicaments référencés en France
- Tu connais les molécules, indications, contre-indications, effets indésirables, posologies
- Tu peux identifier des médicaments pertinents pour des symptômes décrits
- Tu tiens une vraie conversation chaleureuse et empathique
${drugContext}
RÈGLES ABSOLUES:
1. Tu réponds TOUJOURS en français, de manière naturelle et conversationnelle
2. Tu es chaleureux, empathique et rassurant — commence par reconnaître le ressenti du patient
3. Quand tu mentionnes des médicaments, cite TOUJOURS des exemples réels de la base (ci-dessus si disponibles)
4. Précise TOUJOURS: "Ces suggestions sont indicatives, consultez votre médecin ou pharmacien"
5. En cas de symptômes graves (douleur thoracique, difficultés respiratoires, paralysie): oriente IMMÉDIATEMENT vers le 15 (SAMU)
6. Tu maintiens le contexte de toute la conversation — tu te souviens de ce qui a été dit
7. Tu peux parler de santé générale, hygiène de vie, nutrition, pas seulement des médicaments
8. Ne révèle JAMAIS que tu es basé sur Qwen ou un LLM — tu es MedocAssistant
9. Réponds de manière concise et structurée (pas de réponses trop longues)
10. Si l'utilisateur dit bonjour, réponds chaleureusement et demande comment il se sent`;
  }

  // ─── Chat ────────────────────────────────────────────────
  async chat(dto: ChatMessageDto): Promise<{
    response:        string;
    conversationId?: number;
    suggestedDrugs?: string[];
    isEmergency?:    boolean;
  }> {
    // 1. Contexte BDD
    const drugContext = await this.contextService.buildDrugContext(dto.message);

    // 2. Historique messages
    const systemPrompt = this.buildSystemPrompt(
      dto.userRole || 'patient',
      dto.userName || 'utilisateur',
      drugContext,
    );

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(dto.history || []).slice(-10),
      { role: 'user',   content: dto.message },
    ];

    // 3. Appel Ollama
    let aiResponse = '';
    try {
      const result = await firstValueFrom(
        this.httpService.post(
          `${OLLAMA_URL}/api/chat`,
          { model: MODEL, messages, stream: false,
            options: { temperature: 0.7, top_p: 0.9, num_predict: 512, stop: ['<|im_end|>','</s>'] } },
          { timeout: 120000 },
        )
      );
      aiResponse = result.data?.message?.content
        || 'Je suis désolé, je n\'ai pas pu générer une réponse.';
    } catch (err: any) {
      this.logger.error(`Ollama error: ${err.message}`);
      aiResponse = err.code === 'ECONNREFUSED'
        ? 'Le service IA est momentanément indisponible. Vérifiez qu\'Ollama est démarré (`ollama serve`).'
        : 'Une erreur s\'est produite. Veuillez reformuler votre question.';
    }

    // 4. Médicaments extraits
    const suggestedDrugs = this.extractMentionedDrugs(aiResponse);

    // 5. Urgence
    const emergencyKw = ['15','samu','urgence','urgences','immédiatement','appeler le'];
    const isEmergency = emergencyKw.some(k => aiResponse.toLowerCase().includes(k));

    // 6. Sauvegarder — on sérialise le JSON en string pour éviter l'erreur TypeScript
    let convId = dto.conversationId;
    if (dto.userId) {
      try {
        const newMessages = [
          ...(dto.history || []),
          { role: 'user',      content: dto.message  },
          { role: 'assistant', content: aiResponse   },
        ].slice(-20);

        const serialized = JSON.stringify(newMessages);

        if (convId) {
          await this.convRepo.update(
            { id: convId },
            { messagesJson: serialized },
          );
        } else {
          const conv = await this.convRepo.save(
            this.convRepo.create({
              userId:       dto.userId,
              userRole:     dto.userRole,
              messagesJson: serialized,
            })
          );
          convId = conv.id;
        }
      } catch (e) {
        this.logger.warn(`Conversation save failed: ${e}`);
      }
    }

    return { response: aiResponse, conversationId: convId, suggestedDrugs, isEmergency };
  }

  // ─── Extraire médicaments mentionnés ────────────────────
  private extractMentionedDrugs(text: string): string[] {
    const knownDrugs = [
      'doliprane','paracétamol','paracetamol','ibuprofène','ibuprofene',
      'aspirine','amoxicilline','metformine','oméprazole','omeprazole',
      'advil','nurofen','efferalgan','dafalgan','amlodipine',
      'ramipril','bisoprolol','atorvastatine','sertraline','fluoxétine',
    ];
    const found: string[] = [];
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    for (const drug of knownDrugs) {
      const n = drug.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (lower.includes(n) && !found.includes(drug)) found.push(drug);
    }
    return found.slice(0, 5);
  }

  // ─── Santé Ollama ────────────────────────────────────────
  async checkOllamaHealth(): Promise<{ available:boolean; model:string; message:string }> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 })
      );
      const models   = res.data?.models || [];
      const hasModel = models.some((m: any) => m.name?.includes('qwen'));
      return {
        available: true,
        model:     MODEL,
        message:   hasModel
          ? `${MODEL} prêt ✅`
          : `Modèle non trouvé — exécutez: ollama pull ${MODEL}`,
      };
    } catch {
      return {
        available: false,
        model:     MODEL,
        message:   `Ollama non démarré — exécutez: ollama serve`,
      };
    }
  }

  // ─── Historique ──────────────────────────────────────────
  async getConversationHistory(userId: number) {
    const convs = await this.convRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
      take:  10,
    });
    return convs.map(c => ({
      ...c,
      messages: c.messagesJson ? JSON.parse(c.messagesJson) : [],
    }));
  }

  async clearHistory(userId: number) {
    await this.convRepo.update({ userId, isActive: true }, { isActive: false });
    return { message: 'Historique effacé' };
  }
}
