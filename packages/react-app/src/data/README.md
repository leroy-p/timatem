# Suggestions de champions

Le clic sur « i » filtre `champions.json` avec les `championIds` du thème et la position attribuée. Tout fonctionne localement, sans requête réseau.

- `champions.json` : catalogue français de Riot Data Dragon, version indiquée dans `champions-metadata.json`. Noms, identifiants et classes proviennent de Riot ; les positions sont des choix éditoriaux permissifs, pas des recommandations de méta. Les classes Riot ne sont jamais utilisées pour déduire automatiquement une position.
- `themes.json` : libellé, définition, liste de champions et sources. `curated` désigne une sélection utilisable, potentiellement non exhaustive ; `pending` une liste restant à documenter ; `contextual` une consigne dépendant de la partie. Les champions sont considérés sans skin.
- `champions-metadata.json` : version, source et date de préparation. Les positions de Locke restent à documenter ; une liste de positions vide ne signifie pas qu'un champion ne peut se jouer nulle part.

Premier lot : Assassin, Tank, Support (classes Data Dragon), Pas de mana (ressource Data Dragon), Yordle, Demacia, Noxus, Piltover et Zaun (sélections éditoriales à partir des biographies officielles). Les liens des biographies permettent de réexaminer les associations ; elles n'ont pas toutes fait l'objet d'une validation exhaustive. Les régions désignent des liens d'histoire, pas nécessairement un lieu de naissance ou une affiliation actuelle.

Pour compléter un thème : définir précisément sa règle, consulter les sources, renseigner les identifiants exacts, puis passer son statut à `curated`. Ne pas remplacer une absence de données par une liste vide prétendument exhaustive. Pour mettre à jour le catalogue, récupérer la version souhaitée dans l'API publique Data Dragon, conserver les positions existantes par identifiant, puis revoir les nouveaux champions et les associations concernées. Mettre à jour les métadonnées et lancer les tests.

Les tests vérifient les références, l'unicité des identifiants, les positions et le filtrage. Ils ne valident pas les choix éditoriaux.

Positions de Zaahen renseignées en top et jungle à partir des pages OP.GG : https://op.gg/lol/champions/zaahen/build/top et https://op.gg/lol/champions/zaahen/build/jungle.
