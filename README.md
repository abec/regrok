# ReGrok
A basic journal application for desktop environments with application level encryption. Use case: Journaling over Dropbox/Box/Drive/ICloud client. Ideally this application provides a lock for your journaling needs.

**UNDER DEVELOPMENT**

## Goals
1. Keep a journal easily
2. Security (It should be like a lock on your journal). This should be provided via client-side encryption. (Works, but under development)
3. Tagging for ease of personal data collection in a secure way (Under development)

## Installation
1. Download ReGrok and copy to /Applications/.
2. Open /Applications/ReGrok.app.
3. Type in a password, change the action from "login" to "register", and click the button.

## Usage
##### 1. Login
![Login](https://raw.githubusercontent.com/abec/regrok/master/docs/img/login.png)
##### 2. Add a journal entry
![Add a journal entry](https://raw.githubusercontent.com/abec/regrok/master/docs/img/add-entry.png)
##### 3. Manage it in list
![List of journals](https://raw.githubusercontent.com/abec/regrok/master/docs/img/manage-entries.png)

## Compatibility
1. Mac OS X (tested with 10.11.1)

## Roadmap

### 0.1.0
1. Basic client side encryption
2. Write an entry
3. Delete several entries
4. List of entries
5. Markdown support
6. Provide some kind of meaningful errors ;)
7. Database driven configuration through settings
8. Mac OS X support

### 0.2.0
1. Pluggable client side encryption
2. Update an entry
3. Improve error handling
4. Provide better logging
5. Data reset
6. Sessionization?

### 0.3.0
1. Mineable tagging
2. File browsing in settings
3. Windows support?
