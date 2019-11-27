# Installation
1. Put a src/siebel-utils.js file under /public/scripts/custom folder on your web-server
2. Open "Administration - Application" -> "Manifest Files" view
3. Create record with "scripts/custom/siebel-utils.js" value in "Name" field
4. Open "Administration - Application" -> "Manifest Administration"
5. Find record with "Type" = Application, "Usage Type" = Common and "" = "PLATFORM_INDEPENDENT". Or create new one if not exists