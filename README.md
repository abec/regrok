# ReGrok
A basic journal application for desktop environments with application level encryption. Use case: Journaling over Dropbox/Box/Drive/ICloud client. Ideally this application provides a lock for your journaling needs.

**UNDER DEVELOPMENT**

## Goals
1. Keep a journal easily
2. Security (It should be like a lock on your journal). This should be provided via client-side encryption. (Works, but under development)
3. Tagging for ease of personal data collection in a secure way (Under development)

## Installation
1. git clone https://github.com/abec/regrok.git
2. cd regrok
3. npm install
4. grunt build
5. mv dist/*/ReGrok.app ~/Dropbox
6. open ~/Dropbox/ReGrok.app

## Roadmap

### 0.1.0
1. Basic client side encryption
2. Write an entry
3. Delete several entries
4. List of entries
5. Markdown support
6. Provide some kind of meaningful errors ;)
7. Database driven configuration through settings

### 0.2.0
1. Pluggable client side encryption
2. Update an entry
3. Improve error handling
4. Provide better logging
5. Data reset
6. Sessionization?

### 0.3.0
1. Mineable tagging
