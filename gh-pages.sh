git commit -am 'ok cache'
git push 

git checkout gh-pages
git merge master 
git commit -am 'push doc'
git push origin  gh-pages
git checkout master
