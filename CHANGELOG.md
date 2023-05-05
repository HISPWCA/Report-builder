# Changelog

## SchoolCard
- Implement d'une première version de carte scolaire
- les fonctionnalités implémenter: interpretation des données.
    NB : la partie recherche pour trouver les teis n'est pas encore au point. Le Report doit etre redesigner pour que sa soit jolie

## V3.3
- Stabilisation de la version V3.2

## V3.2
- L'unité d'organisation generic fait ( parent 1 , parent 2 , parent 3)
- Interpretation des légends fait
- Implémentation et interpretation de la fonctionnalité titre ( Les titres de centre ou d'unité d'org )

## V3.1
- Implémentation de la fonction génériciter  des organisations unit 

## V3.0
- La fonctionalité legend est correctement implémenter et fini
- La fonctionalite report :
    - Creation 
    - modification 
    - suppression
    - Détail 
sont tous implémenter
- L'id générer est sous la forme: "Dimension | Org unit ( CURRENT ) | légend a appliquée | type de legend "


## V2.2
- Fonctionnalité légend implémenter
- Fonctionnalité interpretation des légends fait 
- Fonctionnalité mise à jour des légends implémentées
- Fonctionnalité mise à jour du repport implémenté
### issues
    - La fonctionnalité légend n'est pas complet. La légend est appliqué à tous le rapport. c'est pas bien
    - La solution c'est d'avoir une group de légend appliquer pour chaque champ (td).


## V2.1 
- Rendre dynamique le coté report par rapport au configuration faite dans la page builder ( design )
- Ajout du fonctionalité Configuration ( configuration des org unit et period )
- Ajout du fonctionalité injection des ids dans le champ ou le td lorsqu'on selectionne une dimension
- Ajout du popup dimensions et légend


## V2.0
- Implémentation de la logique au niveau du designer
- Continuation de l'intégration des indicateurs, des data élements au niveau de la partie design 


##  V1.1
- Amélioration de l'interpretation des légendes: ( les uid passer au td doivent maintenant contenir id du dataElement, id du level au lieu de l'id d'un organisation unit , et la légende : images , ou labels , ou colors )


##  V1.0
- Ajout des légendes au niveau du reports
- Implémentation de la fonction pour interpreter les légendes