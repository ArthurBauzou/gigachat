lancer le serv node en mode daemon : `nohup node ./bin/www &`
Trouver le numero du processus : `ps -ef | grep node`
Fermer le processus : `kill [n°processus]`

pour ouvrir un port avec iptables : `iptables -A INPUT -p tcp --dport 80 -j ACCEPT`
check les ports ouverts : `iptables -L --line-numbers`
detruire une ligne : `iptables -D INPUT [n°ligne]`

Lancer le serv engular sur le port 80 en mode ouvert : `ng serve --open --host 0.0.0.0 --port 80 --disable-host-check `