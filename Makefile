SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist/js

BASE_FILES = ${SRC_DIR}/static_map.js

MODULES = ${SRC_DIR}/static_map.js

JQ = ${DIST_DIR}/static_map.js
JQ_MIN = ${DIST_DIR}/static_map.min.js

MINJAR = java -jar ${BUILD_DIR}/yuicompressor-2.4.2.jar

all: jquery min
	@@echo "Build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

jquery: ${DIST_DIR} ${JQ}

${JQ}: ${MODULES}
	@@echo "Building" ${JQ}

	@@mkdir -p ${DIST_DIR}
	@@cat ${MODULES} > ${JQ};

	@@echo ${JQ} "Built"
	@@echo

min: ${JQ_MIN}

${JQ_MIN}: ${JQ}
	@@echo "Building" ${JQ_MIN}

	@@echo " - Compressing using Minifier"
	@@${MINJAR} ${JQ} > ${JQ_MIN}

	@@echo ${JQ_MIN} "Built"
	@@echo

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
