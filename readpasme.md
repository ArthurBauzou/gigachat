lancer le serv node en mode daemon : `nohup node ./bin/www &`
Trouver le numero du processus : `ps -ef | grep node`
Fermer le processus : `kill [n°processus]`

pour ouvrir un port avec iptables : `iptables -A INPUT -p tcp --dport 80 -j ACCEPT`
check les ports ouverts : `iptables -L --line-numbers`
detruire une ligne : `iptables -D INPUT [n°ligne]`

Lancer le serv engular sur le port 80 en mode ouvert : `ng serve --open --host 0.0.0.0 --port 80 --disable-host-check `

tutos : 
    https://deepinder.me/creating-a-real-time-app-with-angular-8-and-socket-io-with-nodejs
    https://deepinder.me/creating-a-realtime-chat-app-with-angular-and-socket-io-with-nodejs-part-2