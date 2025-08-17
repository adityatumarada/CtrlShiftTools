// Get DOM Elements
const toolSelect = document.getElementById('tool-select');
const formatBtn = document.getElementById('format-btn');
const formatInput = document.getElementById('format-input');
const formatOutput = document.getElementById('format-output');
const errorMessage = document.getElementById('error-message');

// Update placeholder based on selected format
toolSelect.addEventListener('change', () => {
    const selected = toolSelect.value;
    formatInput.placeholder = `Paste ${selected.toUpperCase()} here...`;
    formatOutput.textContent = '';
    errorMessage.textContent = '';
});

// Formatting functions
function formatJSON(text) {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 4);
}

function formatXML(xml) {
    // First, ensure we have valid XML by parsing it
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
    if (parseError) {
        throw new Error(parseError.textContent);
    }

    // Helper function to create indentation
    const indent = (level) => '    '.repeat(level);

    // Recursive function to format XML nodes
    function formatNode(node, level) {
        let result = '';

        // Handle text nodes
        if (node.nodeType === 3) {
            const text = node.textContent.trim();
            if (text) {
                result += indent(level) + text + '\n';
            }
            return result;
        }

        // Handle element nodes
        if (node.nodeType === 1) {
            let hasChildren = node.children.length > 0;
            let hasText = node.childNodes.length === 1 && node.childNodes[0].nodeType === 3;

            // Opening tag with attributes
            let openTag = '<' + node.nodeName;
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                openTag += ' ' + attr.name + '="' + attr.value + '"';
            }

            if (!hasChildren && !hasText) {
                // Self-closing tag
                result += indent(level) + openTag + '/>\n';
            } else if (hasText) {
                // Element with text only
                result += indent(level) + openTag + '>' + node.textContent.trim() + '</' + node.nodeName + '>\n';
            } else {
                // Element with child elements
                result += indent(level) + openTag + '>\n';

                // Process child nodes
                for (let child of node.childNodes) {
                    result += formatNode(child, level + 1);
                }

                // Closing tag
                result += indent(level) + '</' + node.nodeName + '>\n';
            }
        }

        return result;
    }

    // Format the entire document starting from the root element
    return formatNode(xmlDoc.documentElement, 0).trim();
}

// Format button click handler
formatBtn.addEventListener('click', () => {
    const selected = toolSelect.value;
    errorMessage.textContent = '';
    formatOutput.textContent = '';

    try {
        if (selected === 'json') {
            formatOutput.textContent = formatJSON(formatInput.value);
        } else if (selected === 'xml') {
            formatOutput.textContent = formatXML(formatInput.value);
        }
    } catch (e) {
        errorMessage.textContent = `Invalid ${selected.toUpperCase()}: ${e.message}`;
    }
});
