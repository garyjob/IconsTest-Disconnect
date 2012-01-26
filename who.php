<?php 
	$page_data = array("id" => "who", "name" => "Who uses Privacy Icons?");
	
	/*
		- Arriving at any page (What?, The Icons, Get Involved, or Further Reading) loads that page's data via a server-side include from the fragments folder.
		- At that point, the inactive pages have their content lazily loaded via JavaScript.
		- Navigating among the pages updates the URL with the HTML5 History API. The updated URL matches the native URL exactly so that inputting it directly loads content correctly.
		- If JavaScript is disabled, the pages loads normally. Clicking a nav item simply loads the new page.
		- If JavaScript is enabled, but the browser does not support the History API, the animations are not enabled.
	*/
?>
<?php include("inc/doc_head.php"); ?>
<?php include("inc/header.php"); ?>
		<li id="<?php echo $page_data["id"]; ?>" class="<?php echo $page_data["id"]; ?> page">
			<div class="page-body">
				<?php include("fragments/" . $page_data["id"] . ".html"); ?>
			</div> <!-- .page-body -->
		</li>
<?php include("inc/footer.php"); ?>