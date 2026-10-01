# Made 3D Studio — Contabilità Cloud

App Next.js collegata al progetto Supabase `contabilita`.

## Utenti Admin autorizzati

- Talpone — alexsenatores@gmail.com
- Andrea — andrea.damatodj@gmail.com
- Diego — diego.derosa2001@gmail.com

Tutti e tre possono leggere, inserire, modificare ed eliminare i dati condivisi.

## Avvio locale

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`.

Le variabili del progetto Supabase sono già presenti in `.env.local` e usano solo la chiave publishable, che è prevista per il frontend. Non inserire mai una secret/service-role key nel client.

## Primo accesso

1. Aprire `/login`.
2. Selezionare **Primo accesso**.
3. Usare una delle tre Gmail autorizzate e scegliere una password di almeno 8 caratteri.
4. Se Supabase invia una mail di conferma, confermare l'indirizzo.
5. Tornare su `/login` e accedere.

## Dati reali

- PostgreSQL Supabase per movimenti, categorie e utenti applicativi.
- Row Level Security: accesso ai dati solo per le tre email autorizzate.
- Bucket Storage privato `movement-attachments` per foto e PDF.
- Dashboard, grafico e report leggono gli stessi movimenti condivisi.
- Realtime sui movimenti: quando un altro Admin inserisce o elimina un movimento, l'app aggiorna i dati.
- Metodo di pagamento salvato automaticamente come `Contanti`.
