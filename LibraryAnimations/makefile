# makefile for GNU Make utility
# http://gnuwin32.sourceforge.net/packages/make.htm

# Set the source directory
srcdir = src/
builddir = build/
id = $(shell date +%Y%m%d)

# Create the list of modules
modules = ${srcdir}Stage.js\
		  ${srcdir}Controller.js\
		  ${srcdir}VisuData.js\
		  ${srcdir}VisuVariable.js\
		  ${srcdir}VisuArray.js\
		  ${srcdir}VisuButton.js\
		  ${srcdir}VisuScrollbar.js\
		  ${srcdir}VisuLabel.js\
		  ${srcdir}VisuCode.js

# Combined file (temporary file)
combined1 = ${builddir}_combined1.js
combined2 = ${builddir}_combined2.js

# Compressed file (output)
output = ${builddir}inalan${id}.js
		  
all: combine compress copyright clean1 clean2
		  
# Combine files
combine:	
	cat ${modules} > ${combined1}
			
# Compress all of the modules into inalan.js
compress:
	java -jar yuicompressor-2.4.8.jar ${combined1} -o ${combined2} --nomunge

# Add copyright notice	
copyright:
	cat copyright_notice.txt ${combined2} > ${output}
	
# Delete combined files
clean1:
	rm ${combined1}
clean2:
	rm ${combined2}
	
