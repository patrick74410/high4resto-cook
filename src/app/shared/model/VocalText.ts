export class VocalText {
   callServerAll:string[]=[
       "Je veux appeler le serveur",
       "Je veux appeler le serveur en cuisine"
    ];
   resumeSignaled:string[]=[
       "Je veux savoir ce qui est signalé",
       "Je veux un résumé de ce qui est signalé"
    ];
   resumeToTakebyTable:string[]=[
       "Je veux savoir ce qu'il y a à faire par tables",
       "Je veux un résumé de ce qu'il y a à faire",
       "Je veux savoir ce qu'il y a à faire"
    ];
    resumeToTakeByProduct:string[]=[
        "Je veux savoir ce qu'il y a à faire par produits"
    ];
    prepareItem:string[]=[
        "je veux prendre en charge tous les $product",
        "je veux prendre en charge toutes les $product",
        "je veux prendre en charge les $product",
        "je prépare tous les $product",
        "je prépare toutes les $product",
        "je prépare les $product"
    ];
    prepareTable:string[]=[
        "Je veux prendre en charge la table $table",
        "Je veux préparer la table $table",
        "Je veux préparer toute la table $table",
        "Je vais prendre en charge la table $table",
        "Je vais préparer la table $table",
        "Je vais préparer toute la table $table"
    ]
    prepare:string[]=
    [
        "je veux prendre en charge tous les $product de la table $table",
        "je veux prendre en charge toutes les $product de la table $table",
        "je veux prendre en charge les $product de la table $table",
        "je veux préparer tous les $product de la table $table",
        "je veux préparer toutes les $product de la table $table",
        "je veux préparer les $product de la table $table",
        "je vais prendre en charge tous les $product de la table $table",
        "je vais prendre en charge toutes les $product de la table $table",
        "je vais prendre tous les $product de la table $table",
        "je vais prendre toutes les $product de la table $table",
        "je vais prendre en charge les $product de la table $table",
        "je vais préparer tous les $product de la table $table",
        "je vais préparer toutes les $product de la table $table",
        "je vais préparer les $product de la table $table",
    ]
    prepareOnly:string[]=[
        "je veux prendre en charge le $product de la table $table",
        "je veux prendre en charge la $product de la table $table",
        "je veux prendre en charge l'$product de la table $table",
        "je veux prendre en charge un $product de la table $table",
        "je veux prendre en charge une $product de la table $table",

        "je veux préparer le $product de la table $table",
        "je veux préparer la $product de la table $table",
        "je veux préparer l'$product de la table $table",
        "je veux préparer un $product de la table $table",
        "je veux préparer une $product de la table $table",
    ]
    finishAllProduct:string[]=[
        "J'ai terminé toute les $product",
        "J'ai terminé tous les $product",
        "J'ai terminé les $product"
    ]
    finishAllTable:string[]=[
        "J'ai terminé tous les éléments de la table $table",
        "J'ai terminé tous les produits la table $table",
        "J'ai terminé toute la table $table"
    ]
    finishAll:string[]=[
        "J'ai terminé tous les $product de la table $table",
        "J'ai terminé toutes les $product de la table $table"
    ]
    finishOne:string[]=[
        "J'ai terminé une $product de la table $table",
        "J'ai terminé un $product de la table $table",
        "J'ai terminé le $product de la table $table",
        "J'ai terminé la $product de la table $table"
    ]

}