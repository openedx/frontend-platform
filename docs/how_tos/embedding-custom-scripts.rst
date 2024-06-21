##########################
Embedding Custom Scripts
##########################

.. contents:: Table of Contents

Introduction
************

In modern web applications, there is a need to embed external scripts to expand the functionality of the application or integrate third-party services (analytics tools, widgets, etc.).
This tutorial explains how to add custom scripts through Django site configurations.

Configuration Overview
=======================

Configuration for embedding custom scripts can be done through the global `MFE_CONFIG` and the `MFE_CONFIG_OVERRIDES`. These configurations allow specifying scripts to be inserted into different parts of the HTML document, such as the `<head>` section or various positions within the `<body>`.

Configuring External Scripts
=============================

External scripts can be specified in the `MFE_CONFIG` or `MFE_CONFIG_OVERRIDES` JSON objects. Each script can be inserted into one of the following locations:
- `head`: Inserts the script into the `<head>` section.
- `body.top`: Inserts the script at the beginning of the `<body>` section.
- `body.bottom`: Inserts the script at the end of the `<body>` section.

Scripts can be provided either as a URL (`src`) or as inline script content.

Example Configuration
=====================

Example 1: Using `MFE_CONFIG_OVERRIDES`
---------------------------------------

```json
{
  "MFE_CONFIG_OVERRIDES": {
    "<MFE>": {
      "EXTERNAL_SCRIPTS": [
        {
          "head": "",
          "body": {
            "top": "",
            "bottom": "<script src=\"https://example.com/widget/loader.js\"></script>"
          }
        }
      ]
    }
  }
}

Example 1: Using `MFE_CONFIG`
---------------------------------------
```json
{
  "MFE_CONFIG": {
    "EXTERNAL_SCRIPTS": [
      {
        "head": "<script>console.log('Inline script in head');</script>",
        "body": {
          "top": "<script>console.log('Inline script at body top');</script>",
          "bottom": "<script src=\"https://example.com/widget/loader.js\"></script>"
        }
      }
    ]
  }
}
