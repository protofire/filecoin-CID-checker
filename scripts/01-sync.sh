PROJECT_NAME=filecoin-CID-checker
TMP_HOME=$HOME/www/$PROJECT_NAME
NODE_ENV=dev

# change to your server's ip
IP=192.168.77.13
# change to your server's user
SSH_USER=ubuntu
# change to your server's code base folder
REMOTE_HOME=/home/ubuntu/www
SSH_PORT=22

set -o nounset
set -o errexit

echo "PWD='$PWD'"
echo "TMP='$TMP_HOME'"
echo "$SSH_USER@$IP:$REMOTE_HOME/"

echo "Sleeping"
sleep 3

cd $TMP_HOME
yarn install

cd $TMP_HOME/packages/frontend
yarn run build

cd $TMP_HOME
rsync -azv --delete --copy-links --exclude=.git --exclude=.env --exclude=api --exclude=ui --exclude=node_modules . $SSH_USER@$IP:/$REMOTE_HOME

echo "Sync finished"

ssh -p $SSH_PORT -n -f $SSH_USER@$IP "cd $REMOTE_HOME; yarn install; cd $REMOTE_HOME/packages/backend; pm2 restart .ecosystem.config.js --update-env"

echo "App restarted"

