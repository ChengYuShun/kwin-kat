NAME = kat
VERSION = 0

SRCDIR = src
PKGDIR = pkg
TESTDIR = test

SRC = $(shell find $(SRCDIR) -type f -name '*.ts')
TEST = $(shell find $(TESTDIR) -type f -name '*.ts')

JS = node
TSC = tsc

TSCFLAGS = --removeComments --strictNullChecks --alwaysStrict --noEmitOnError \
           --target "es2016" --lib "es2016"

MAIN_JS = main.js 
TEST_JS = test.js
KWINSCRIPT = $(NAME).kwinscript

include config.mk

all: $(KWINSCRIPT)

$(KWINSCRIPT): $(MAIN_JS) res/metadata.json
	mkdir -p pkg

	sed "s/%VERSION%/$(VERSION)/" res/metadata.json > pkg/metadata.json

	mkdir -p pkg/contents/code
	cp -f $(MAIN_JS) pkg/contents/code/main.js
	zip -r $@ $(PKGDIR) 2>&1 1>/dev/null

$(MAIN_JS): $(SRC)
	$(TSC) $^ $(TSCFLAGS) --outFile $@
	echo "main();" >> $@

test: $(TEST_JS)
	$(JS) $^

$(TEST_JS): $(SRC) $(TEST)
	tsc $^ $(TSCFLAGS) --lib "es2016, dom" --outFile $@
	echo "test();" >> $@

clean:
	rm -rf $(KWINSCRIPT) $(MAIN_JS) $(TEST_JS) pkg

.PHONY: all test clean
