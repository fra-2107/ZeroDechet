<?php
    require_once('database.php');

    // Database connexion.
    $db = dbConnect();
    if (!$db)
    {
        header ('HTTP/1.1 503 Service Unavailable');
        exit;
    }

    // Check the request.
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    $request = $_SERVER['PATH_INFO'];
    $request = explode('/', $request);
    
    $id=$request[2];

    if ($request[1] != 'user')
    {

    if ($requestMethod == 'GET')
    {
        if(isset($_GET['login']))
            $data = dbRequestuser($db, $_GET['login']);
        else 
            $data = dbRequestuser($db);
    }
  
    // TODO : 

    // if ($requestMethod == 'POST')
    //     if(isset($_POST['login'])&&isset($_POST['text']))
    //         $data = dbAdduser($db, $_POST['login'], strip_tags($_POST['text']));
    
    // TODO : 

    // if ($requestMethod == 'PUT')
    // {
    //     parse_str(file_get_contents('php://input'), $_PUT);
    //     if($id !=''&&isset($_PUT['login'])&&isset($_PUT['text']))
    //         $data = dbModifyTweet($db, $id, $_PUT['login'], strip_tags($_PUT['text']));
    // }
    
    // TODO :

    // if ($requestMethod == 'DELETE')
    // {
    //     if($id !=''&&isset($_GET['login']))
    //         $data = dbDeleteTweet($db, intval($id), $_GET['login']);
    // }
    }
    if ($request[1] == 'event')
    {
        if ($requestMethod == 'GET')
        {
            $data = dbRequestevent($db);
        }

        // TODO : handle other request methods for 'event' if needed

    }

    if ($request[1] == 'message')
    {
        if ($requestMethod == 'GET')
        {
            $data = dbRequestmessage($db);
        }

        // TODO : handle other request methods for 'message' if needed

    }


    
    // Send data to the client.
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    if($requestMethod == 'POST')
        header('HTTP/1.1 201 Created');
    else
        header('HTTP/1.1 200 OK');
    echo json_encode($data);
    exit;
?>
