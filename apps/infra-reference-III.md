### Infra Reference III (The root Prisma Service where all child prisma modules converge in WS-Server)


For the best prisma reference, please see the following file: 

[Prisma Attachment Provider File (most comprehensive and comparable for our purposes)](../../../cloneathon/t3-chat-clone/turborepo/apps/ws-server/src/prisma/attachment-provider.ts)


it has an [absolute path of `/home/dopaminedriven/cloneathon/t3-chat-clone/turborepo/apps/ws-server/src/prisma/attachment-provider.ts`](../../../cloneathon/t3-chat-clone/turborepo/apps/ws-server/src/prisma/attachment-provider.ts)

Please proceed to reference number IV [reference-IV.md](./infra-reference-IV.md)

```ts
import { ExtractService } from "@/extract/index.ts";
import { PrismaChatService } from "@/prisma/chat.ts";
import { DbService } from "@slipstream/db/node";

/**
 * **Inheritance chain**
 * [*parent*]
 * `@/prisma/index.ts`
 *  ⬆
 * `@/prisma/chat.ts`
 *  ⬆
 * `@/prisma/user-meta.ts`
 *  ⬆
 * `@/prisma/attachment.ts`
 *  ⬆
 * `@/prisma/attachment-provider.ts`
 *  ⬆
 * `@/prisma/utils.ts`
 * [*child*]
 */

export class PrismaService extends PrismaChatService {
  constructor(
    prisma: DbService,
    extractor: ExtractService,
     isProd: boolean
  ) {
    super(prisma, extractor, isProd);
  }
}

```
