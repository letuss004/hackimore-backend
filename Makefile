deploy:
	ssh root@89.167.9.56 "export NVM_DIR=\"\$$HOME/.nvm\"; [ -s \"\$$NVM_DIR/nvm.sh\" ] && \\. \"\$$NVM_DIR/nvm.sh\"; cd him-be && bash entry.sh"
