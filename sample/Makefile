TS = masked-input.ts masker.ts index.ts mask.ts
HTML = masked-input.html

ODIR = src/plugins/masked-input
SDIR = ../src

TSS = $(TS:%=$(SDIR)/%)
JSS = $(TS:%.ts=$(SDIR)/%.js)
JSO = $(TS:%.ts=$(ODIR)/%.js)
HTMLS = $(HTML:%=$(SDIR)/%)
HTMLO = $(HTML:%=$(ODIR)/%)


all: js html

js: $(JSO)

$(JSO): $(JSS)
	cp $(JSS) $(ODIR)
	rm -f $(SDIR)/*.js
	rm -f $(SDIR)/*.map

$(JSS): $(TSS)
	./node_modules/.bin/tsc -p $(ODIR)

html: $(HTMLO)

$(HTMLO): $(HTMLS)
	cp $(HTMLS) $(ODIR)
clean:
	rm -f $(HTMLO)
	rm -f $(ODIR)/*.js
	rm -f $(ODIR)/*.map
	rm -f $(SDIR)/*.js
	rm -f $(SDIR)/*.map
