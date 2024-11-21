NAME=accent-directories
DOMAIN=taiwbi.com

.PHONY: all pack install clean

all: dist/extension.js

node_modules: package.json
	npm install

dist/extension.js: node_modules
	tsc

$(NAME).zip: dist/extension.js
	@cp metadata.json dist/
	@cp -r icons dist/
	@(cd dist && zip ../$(NAME)@$(DOMAIN).zip -9r .)

pack: $(NAME).zip

install: $(NAME).zip
	@touch ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@rm -rf ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@mv dist ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)

clean:
	@rm -rf dist node_modules $(NAME)@$(DOMAIN).zip