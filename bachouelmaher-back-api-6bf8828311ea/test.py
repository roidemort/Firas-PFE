import random

def alea(fichier="alea.txt"):
    
    rows, cols = 8, 5
    with open(fichier, "w", encoding="utf-8") as f:
        for _ in range(rows):
            line = " ".join(str(random.randint(10, 99)) for _ in range(cols))
            f.write(line + "\n")

# Exemple d'utilisation
if __name__ == "__main__":
    alea()  # crée alea.txt
    # ou alea("mon_fichier.txt")
