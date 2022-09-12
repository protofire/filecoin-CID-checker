USER=`whoami`
SOURCE_HOME=$HOME/tmp/filecoin-cid-checker
SOURCE_REP=git@github.com:protofire/filecoin-CID-checker.git
IP=18.133.0.46
SSH_USER=ubuntu
REMOTE_HOME=/home/ubuntu/www

if [ -d $SOURCE_HOME ];
then
    echo "SKIPPING $SOURCE_HOME"
else
    mkdir -p $SOURCE_HOME
	echo "CREATED $SOURCE_HOME"
fi

cd $SOURCE_HOME
if [ -d .git ];
then
    echo "git pull - $SOURCE_HOME - protofire"
    git pull
    git checkout master
else
    git clone $SOURCE_REP .
	echo "GIT READY - protofire"
	git checkout master
fi


