# test-dev-fullstack-2025-la-metis

Soumission du test pour La Mètis par Tom Bazarnik.

## Structure

Le sujet original est disponible dans le fichier [`SUBJECT.md`](SUBJECT.md).

```sh
.
├── README.md                         # Ce fichier
├── SUBJECT.md                        # Sujet original du test
├── .github                           # GitHub actions
└── src                               # Code source
    ├── index.ts                      # Point d'entrée
    ├── data-source.ts                # Source de données (TypeORM)
    └── <module>                      # Module de fonctionnalité
        ├── <module>.route.ts         # Routes (endpoints documentés)
        ├── <module>.entity.ts        # Entité (TypeORM, peut être utilisé comme repository)
        ├── <module>.controller.ts    # Contrôleur (gestion des routes)
        ├── <module>.validator.ts     # Validateur (équivalents aux DTOs)
        └── <module>.service.ts       # Service (logique métier)
```

## Installation

```bash
npm install
```

## Migrations

Pour le test technique, j'ai ajouté TypeORM pour gérer la base de données SQLite et un système de migrations.

Avant de lancer le projet, il faut initialiser la base de données.

```bash
npm run migration:run
```

### Commandes

Note: On fera usage de `ts-node` pour que TypeORM puisse gérer les fichiers TypeScript.

```bash
npm run migration:show                            # Affiche les migrations
npm run migration:generate src/migrations/<name>  # Génère une migration
npm run migration:run                             # Exécute les migrations
npm run migration:revert                          # Annule la dernière migration
```

## Usage

```bash
npm run dev
```

## Tests

> [!NOTE]  
> Lacking experience with Hono myself and how to integrate it well with **both** TypeORM (with decorators) and Vitest, most of the e2e setup was done with the help of AI.

This will run both unit and e2e tests using Vitest and Supertest. A dev server (with values from `.env.test`) will be spawned to run the tests against.

```bash
npm test
```

## License

MIT @ [Tom Bazarnik](https://github.com/tommywalkie)
