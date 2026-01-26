#!/bin/sh

CORRECT_NAME="Denny-smart"
CORRECT_EMAIL="ownerkirimi@gmail.com"

# Check Author
if echo "$GIT_AUTHOR_NAME" | grep -qi "lovable" || echo "$GIT_AUTHOR_EMAIL" | grep -qi "lovable"; then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi

# Check Committer
if echo "$GIT_COMMITTER_NAME" | grep -qi "lovable" || echo "$GIT_COMMITTER_EMAIL" | grep -qi "lovable"; then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
