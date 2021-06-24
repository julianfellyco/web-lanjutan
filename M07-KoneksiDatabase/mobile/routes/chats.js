const express = require('express');
const router = express.Router();
const chatsCtrl = require('../controllers/chats')

//Chat
router.post('/chats', chatsCtrl.get_chats)
router.get('/chat-global', chatsCtrl.get_global_chat)
router.get('/chat-private', chatsCtrl.get_private_chat)
router.get('/chat-list', chatsCtrl.get_list_chat)
router.get('/tekniker-chat-list', chatsCtrl.get_tekniker_list_chat)
router.get('/chat-photo-global', chatsCtrl.chat_photo_global)
router.get('/chat-photo-private', chatsCtrl.chat_photo_private)

module.exports = router;