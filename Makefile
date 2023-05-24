NAME = kat

SRCDIR = src
PKGDIR = pkg
TESTDIR = test

TSCFLAGS = --removeComments --strictNullChecks --alwaysStrict --noEmitOnError \
           --target "es2016" --lib "es2016"

SRC = $(shell find $(SRCDIR) -type f -name '*.ts')
TEST = $(shell find $(TESTDIR) -type f -name '*.ts')
PKG = $(shell find $(PKGDIR) -name '*')

MAIN_JS = main.js 
TEST_JS = test.js
KWINSCRIPT = $(NAME).kwinscript

# You should include definition of variable "JS", which specifies your chosen
# javascript runtime. Example values include "node".
include config.mk

all: $(KWINSCRIPT)

$(KWINSCRIPT): $(MAIN_JS) $(PKG)
	mkdir -p pkg/contents/code
	cp -f $(MAIN_JS) pkg/contents/code/main.js
	zip -r $@ $(PKGDIR) 2>&1 1>/dev/null

$(MAIN_JS): $(SRC)
	tsc $^ $(TSCFLAGS) --outFile $@
	echo "main();" >> $@

test: $(TEST_JS)
	$(JS) $^

$(TEST_JS): $(SRC) $(TEST)
	tsc $^ $(TSCFLAGS) --lib "es2016, dom" --outFile $@
	echo "test();" >> $@

clean:
	rm -f $(KWINSCRIPT) $(MAIN_JS) $(TEST_JS)

.PHONY: all test clean
