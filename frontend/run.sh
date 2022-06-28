#!/usr/bin/env bash

case $1 in
  start)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    if [ "$NODE_ENV" == "production" ]
    then
      npm run build
      serve -s build
    else
      npm start | cat
    fi
    ;;
  build)
    npm build
    ;;
  test)
    npm test $@
    ;;
  *)
    npm "$@"
    ;;
esac
