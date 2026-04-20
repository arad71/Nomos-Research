#!/usr/bin/env bash

case $1 in
  start)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    if [ "$NODE_ENV" == "production" ]
    then
      npm run build
      npm run preview -- --host 0.0.0.0 --port "${PORT:-3000}"
    else
      npm start -- --host 0.0.0.0 --port "${PORT:-3000}" | cat
    fi
    ;;
  build)
    npm run build
    ;;
  test)
    npm test $@
    ;;
  *)
    npm "$@"
    ;;
esac
